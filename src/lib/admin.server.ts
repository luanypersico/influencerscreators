import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ARSENAL_ORIGIN } from "./auth-invite.server";

export type AdminRole = "super_admin" | "admin" | "coproducer" | "support" | "member";
export type CollaboratorRole = "coproducer" | "editor" | "support";

/**
 * Vínculo entre usuário e produto — escopado, nunca global. Só super_admin
 * cria ou revoga. A unicidade por (product_id, user_id) é garantida pelo
 * banco (UNIQUE constraint), não só por esta checagem.
 */
export async function createProductCollaborator(params: {
  actorId: string;
  productId: string;
  userId: string;
  role: CollaboratorRole;
}): Promise<void> {
  const { error } = await supabaseAdmin.from("product_collaborators").insert({
    product_id: params.productId,
    user_id: params.userId,
    role: params.role,
    created_by: params.actorId,
  });
  if (error) throw new Error(error.message);

  await logAudit({
    actorId: params.actorId,
    action: "collaborator.create",
    entity: "product_collaborators",
    entityId: `${params.productId}:${params.userId}`,
    meta: { role: params.role },
  });
}

export async function revokeProductCollaborator(params: {
  actorId: string;
  productId: string;
  userId: string;
}): Promise<void> {
  const { error } = await supabaseAdmin
    .from("product_collaborators")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("product_id", params.productId)
    .eq("user_id", params.userId);
  if (error) throw new Error(error.message);

  await logAudit({
    actorId: params.actorId,
    action: "collaborator.revoke",
    entity: "product_collaborators",
    entityId: `${params.productId}:${params.userId}`,
  });
}

/** Garante que o chamador tem papel administrativo. Retorna os papéis dele. */
export async function assertAdmin(userId: string): Promise<AdminRole[]> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw new Error(`Falha ao validar permissões: ${error.message}`);

  const roles = (data ?? []).map((r) => r.role as AdminRole);
  if (!roles.includes("super_admin") && !roles.includes("admin")) {
    throw new Error("Acesso restrito ao administrador.");
  }
  return roles;
}

export async function assertSuperAdmin(userId: string): Promise<void> {
  const roles = await assertAdmin(userId);
  if (!roles.includes("super_admin")) {
    throw new Error("Somente o super admin pode executar esta ação.");
  }
}

export async function logAudit(params: {
  actorId: string;
  action: string;
  entity?: string | undefined;
  entityId?: string | null | undefined;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .eq("id", params.actorId)
    .maybeSingle();

  await supabaseAdmin.from("admin_audit_log").insert({
    actor_id: params.actorId,
    actor_email: profile?.email ?? null,
    action: params.action,
    entity: params.entity ?? null,
    entity_id: params.entityId ?? null,
    meta: (params.meta ?? {}) as never,
  });
}

const ONBOARDING_COOLDOWN_MS = 60_000;

export type ArsenalOnboardingMethod = "INVITE" | "RECOVERY";
export type ArsenalOnboardingStatus = "READY" | "ENTITLEMENT_REPAIR_REQUIRED";

export type ArsenalOnboardingPreview = {
  email: string;
  authExists: boolean;
  hasPaidOrder: boolean;
  hasActiveAccess: boolean;
  method: ArsenalOnboardingMethod;
  status: ArsenalOnboardingStatus;
};

function normalizeBuyerEmail(email: string): string {
  return email.trim().toLowerCase();
}

function activeAccess(
  row: { revoked_at: string | null; suspended_at: string | null; expires_at: string | null } | null,
): boolean {
  return Boolean(
    row &&
    !row.revoked_at &&
    !row.suspended_at &&
    (!row.expires_at || new Date(row.expires_at).getTime() > Date.now()),
  );
}

/**
 * Resolves a buyer's onboarding route entirely from server-side facts. This
 * function never writes orders, access rows, Auth users, or roles.
 */
export async function previewArsenalOnboarding(params: {
  actorId: string;
  email: string;
  controlledTest?: boolean;
}): Promise<ArsenalOnboardingPreview> {
  await assertSuperAdmin(params.actorId);
  const email = normalizeBuyerEmail(params.email);
  if (!email.includes("@")) throw new Error("Informe um e-mail válido.");

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", "bergamo")
    .maybeSingle();
  if (productError || !product)
    throw new Error(productError?.message ?? "Produto Bergamo não encontrado.");

  const { data: userId, error: userError } = await supabaseAdmin.rpc("find_user_id_by_email", {
    _email: email,
  });
  if (userError) throw new Error(userError.message);

  const [ordersResult, accessResult] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id")
      .eq("product_id", product.id)
      .eq("status", "paid")
      .eq("buyer_email", email)
      .limit(1),
    userId
      ? supabaseAdmin
          .from("product_access")
          .select("revoked_at, suspended_at, expires_at")
          .eq("product_id", product.id)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (ordersResult.error) throw new Error(ordersResult.error.message);
  if (accessResult.error) throw new Error(accessResult.error.message);

  const hasPaidOrder = (ordersResult.data ?? []).length > 0;
  const hasActiveAccess = activeAccess(accessResult.data);
  if (!params.controlledTest && !hasPaidOrder && !hasActiveAccess) {
    throw new Error("Comprador sem compra Bergamo aprovada nem acesso legítimo.");
  }

  return {
    email,
    authExists: Boolean(userId),
    hasPaidOrder,
    hasActiveAccess,
    method: userId ? "RECOVERY" : "INVITE",
    status:
      hasPaidOrder && Boolean(userId) && !hasActiveAccess && !params.controlledTest
        ? "ENTITLEMENT_REPAIR_REQUIRED"
        : "READY",
  };
}

/** Sends one secure Arsenal onboarding link without changing commercial data. */
export async function resendArsenalOnboarding(params: {
  actorId: string;
  email: string;
  controlledTest?: boolean;
  confirm: boolean;
}): Promise<ArsenalOnboardingPreview & { sent: boolean }> {
  if (!params.confirm) throw new Error("Confirmação explícita obrigatória para reenviar o acesso.");
  const preview = await previewArsenalOnboarding(params);
  if (preview.status === "ENTITLEMENT_REPAIR_REQUIRED") return { ...preview, sent: false };

  const cooldownSince = new Date(Date.now() - ONBOARDING_COOLDOWN_MS).toISOString();
  const { data: recent, error: cooldownError } = await supabaseAdmin
    .from("admin_audit_log")
    .select("id")
    .eq("action", "arsenal.onboarding.resend")
    .eq("entity", "buyer")
    .eq("entity_id", preview.email)
    .gte("created_at", cooldownSince)
    .limit(1);
  if (cooldownError) throw new Error(cooldownError.message);
  if ((recent ?? []).length > 0) throw new Error("Aguarde um minuto antes de reenviar o acesso.");

  const redirectTo =
    preview.method === "INVITE"
      ? ARSENAL_ORIGIN
      : `${ARSENAL_ORIGIN}/auth/callback?next=/auth/set-password`;
  const result =
    preview.method === "INVITE"
      ? await supabaseAdmin.auth.admin.inviteUserByEmail(preview.email, { redirectTo })
      : await supabaseAdmin.auth.resetPasswordForEmail(preview.email, { redirectTo });
  if (result.error) throw new Error(result.error.message);

  await logAudit({
    actorId: params.actorId,
    action: "arsenal.onboarding.resend",
    entity: "buyer",
    entityId: preview.email,
    meta: {
      method: preview.method,
      result: "accepted",
      controlled_test: Boolean(params.controlledTest),
    },
  });
  return { ...preview, sent: true };
}

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  roles: AdminRole[];
  products: {
    id: string;
    product_id: string;
    slug: string;
    name: string;
    source: string;
    expires_at: string | null;
    revoked_at: string | null;
  }[];
  last_sign_in_at: string | null;
  email_confirmed: boolean;
};

export async function listUsers(search?: string): Promise<AdminUserRow[]> {
  const [{ data: profiles, error }, { data: roles }, { data: access }, { data: products }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin
        .from("product_access")
        .select("id, user_id, product_id, source, expires_at, revoked_at"),
      supabaseAdmin.from("products").select("id, slug, name"),
    ]);

  if (error) throw new Error(error.message);

  const authList = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authMap = new Map(
    (authList.data?.users ?? []).map((u) => [
      u.id,
      {
        last_sign_in_at: u.last_sign_in_at ?? null,
        email_confirmed: Boolean(u.email_confirmed_at),
      },
    ]),
  );
  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  const term = (search ?? "").trim().toLowerCase();

  return (profiles ?? [])
    .filter(
      (p) =>
        !term ||
        p.email.toLowerCase().includes(term) ||
        (p.full_name ?? "").toLowerCase().includes(term),
    )
    .map((p) => ({
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      phone: p.phone,
      status: p.status,
      notes: p.notes,
      created_at: p.created_at,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AdminRole),
      products: (access ?? [])
        .filter((a) => a.user_id === p.id)
        .map((a) => ({
          id: a.id,
          product_id: a.product_id,
          slug: productMap.get(a.product_id)?.slug ?? "?",
          name: productMap.get(a.product_id)?.name ?? "Produto removido",
          source: a.source,
          expires_at: a.expires_at,
          revoked_at: a.revoked_at,
        })),
      last_sign_in_at: authMap.get(p.id)?.last_sign_in_at ?? null,
      email_confirmed: authMap.get(p.id)?.email_confirmed ?? false,
    }));
}

export async function createUser(params: {
  actorId: string;
  email: string;
  password?: string;
  fullName?: string;
  role: AdminRole;
  productIds: string[];
  notes?: string;
}): Promise<{ userId: string; tempPassword?: string | undefined }> {
  const email = params.email.trim().toLowerCase();
  const tempPassword = params.password?.trim() || randomPassword();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: params.fullName ?? null },
  });
  if (error || !data.user) throw new Error(error?.message ?? "Não foi possível criar o usuário.");

  const userId = data.user.id;

  await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, email, full_name: params.fullName ?? null, notes: params.notes ?? null });

  if (params.role !== "member") {
    await supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: params.role });
  }

  for (const productId of params.productIds) {
    await supabaseAdmin.from("product_access").upsert({
      user_id: userId,
      product_id: productId,
      source: "manual",
      granted_by: params.actorId,
    });
  }

  await logAudit({
    actorId: params.actorId,
    action: "user.create",
    entity: "user",
    entityId: userId,
    meta: { email, role: params.role, products: params.productIds.length },
  });

  return { userId, tempPassword: params.password ? undefined : tempPassword };
}

export async function deleteUser(params: { actorId: string; userId: string }): Promise<void> {
  if (params.actorId === params.userId) throw new Error("Você não pode excluir a própria conta.");
  const { error } = await supabaseAdmin.auth.admin.deleteUser(params.userId);
  if (error) throw new Error(error.message);
  await logAudit({
    actorId: params.actorId,
    action: "user.delete",
    entity: "user",
    entityId: params.userId,
  });
}

export async function setUserPassword(params: {
  actorId: string;
  userId: string;
  password: string;
}): Promise<void> {
  if (params.password.length < 8) throw new Error("A senha precisa de pelo menos 8 caracteres.");
  const { error } = await supabaseAdmin.auth.admin.updateUserById(params.userId, {
    password: params.password,
  });
  if (error) throw new Error(error.message);
  await logAudit({
    actorId: params.actorId,
    action: "user.password_reset",
    entity: "user",
    entityId: params.userId,
  });
}

export async function setUserRole(params: {
  actorId: string;
  userId: string;
  role: AdminRole;
  enabled: boolean;
}): Promise<void> {
  if (params.enabled) {
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: params.userId, role: params.role });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", params.userId)
      .eq("role", params.role);
    if (error) throw new Error(error.message);
  }
  await logAudit({
    actorId: params.actorId,
    action: params.enabled ? "role.grant" : "role.revoke",
    entity: "user",
    entityId: params.userId,
    meta: { role: params.role },
  });
}

export async function setAccess(params: {
  actorId: string;
  userId: string;
  productId: string;
  enabled: boolean;
  expiresAt?: string | null;
}): Promise<void> {
  if (params.enabled) {
    const { error } = await supabaseAdmin.from("product_access").upsert({
      user_id: params.userId,
      product_id: params.productId,
      source: "manual",
      granted_by: params.actorId,
      expires_at: params.expiresAt ?? null,
      revoked_at: null,
    });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin
      .from("product_access")
      .delete()
      .eq("user_id", params.userId)
      .eq("product_id", params.productId);
    if (error) throw new Error(error.message);
  }
  await logAudit({
    actorId: params.actorId,
    action: params.enabled ? "access.grant" : "access.revoke",
    entity: "product_access",
    entityId: `${params.userId}:${params.productId}`,
  });
}

/** Envio de e-mail transacional/campanha via Resend. */
export async function sendEmails(params: {
  actorId: string;
  recipients: string[];
  subject: string;
  html: string;
  campaignId?: string | null;
}): Promise<{ sent: number; failed: number; errors: string[] }> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "Envio de e-mail não configurado: falta a chave do provedor de e-mail (RESEND_API_KEY).",
    );
  }

  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "email")
    .maybeSingle();

  const cfg = (settings?.value ?? {}) as { from_name?: string; from_email?: string };
  const fromEmail = cfg.from_email?.trim();
  if (!fromEmail) {
    throw new Error("Defina o e-mail remetente em Configurações antes de enviar.");
  }
  const from = cfg.from_name ? `${cfg.from_name} <${fromEmail}>` : fromEmail;

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const to of params.recipients) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], subject: params.subject, html: params.html }),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!res.ok) throw new Error(body.message ?? `HTTP ${res.status}`);
      sent += 1;
      await supabaseAdmin.from("email_messages").insert({
        campaign_id: params.campaignId ?? null,
        to_email: to,
        subject: params.subject,
        status: "sent",
        provider_ref: body.id ?? null,
        sent_at: new Date().toISOString(),
      });
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      errors.push(`${to}: ${message}`);
      await supabaseAdmin.from("email_messages").insert({
        campaign_id: params.campaignId ?? null,
        to_email: to,
        subject: params.subject,
        status: "failed",
        error: message,
      });
    }
  }

  if (params.campaignId) {
    await supabaseAdmin
      .from("email_campaigns")
      .update({
        status: failed && !sent ? "failed" : "sent",
        sent_count: sent,
        failed_count: failed,
        sent_at: new Date().toISOString(),
      })
      .eq("id", params.campaignId);
  }

  await logAudit({
    actorId: params.actorId,
    action: "email.send",
    entity: "email",
    entityId: params.campaignId ?? undefined,
    meta: { sent, failed, subject: params.subject },
  });

  return { sent, failed, errors };
}

export async function resolveRecipients(params: {
  audience: "all" | "buyers" | "leads" | "product" | "manual";
  productId?: string | null;
  manual?: string[];
}): Promise<string[]> {
  const emails = new Set<string>();

  if (params.audience === "manual") {
    (params.manual ?? []).forEach((e) => e.trim() && emails.add(e.trim().toLowerCase()));
    return [...emails];
  }

  if (params.audience === "all" || params.audience === "buyers") {
    const { data } = await supabaseAdmin.from("profiles").select("email").eq("status", "active");
    (data ?? []).forEach((p) => emails.add(p.email.toLowerCase()));
  }

  if (params.audience === "buyers") {
    const { data: access } = await supabaseAdmin.from("product_access").select("user_id");
    const ids = new Set((access ?? []).map((a) => a.user_id));
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, email");
    emails.clear();
    (profiles ?? []).filter((p) => ids.has(p.id)).forEach((p) => emails.add(p.email.toLowerCase()));
  }

  if (params.audience === "leads") {
    const { data } = await supabaseAdmin.from("leads").select("email");
    (data ?? []).forEach((l) => emails.add(l.email.toLowerCase()));
  }

  if (params.audience === "product" && params.productId) {
    const { data: access } = await supabaseAdmin
      .from("product_access")
      .select("user_id")
      .eq("product_id", params.productId);
    const ids = new Set((access ?? []).map((a) => a.user_id));
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id, email");
    (profiles ?? []).filter((p) => ids.has(p.id)).forEach((p) => emails.add(p.email.toLowerCase()));
  }

  return [...emails];
}

export type AdminOverview = {
  users: number;
  admins: number;
  paidOrders: number;
  revenueCents: number;
  leads: number;
  accessCount: number;
  products: {
    id: string;
    slug: string;
    name: string;
    status: string;
    buyers: number;
    revenueCents: number;
    isCoproduction: boolean;
    sharePct: number;
  }[];
  revenueByDay: { day: string; cents: number }[];
};

export async function getOverview(): Promise<AdminOverview> {
  const [
    { data: profiles },
    { data: roles },
    { data: orders },
    { data: leads },
    { data: access },
    { data: products },
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("id"),
    supabaseAdmin.from("user_roles").select("role"),
    supabaseAdmin.from("orders").select("product_id, amount_cents, status, paid_at, created_at"),
    supabaseAdmin.from("leads").select("id"),
    supabaseAdmin.from("product_access").select("product_id"),
    supabaseAdmin
      .from("products")
      .select("id, slug, name, status, is_coproduction, revenue_share_pct"),
  ]);

  const paid = (orders ?? []).filter((o) => o.status === "paid");
  const byDay = new Map<string, number>();
  paid.forEach((o) => {
    const day = (o.paid_at ?? o.created_at).slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + o.amount_cents);
  });

  return {
    users: (profiles ?? []).length,
    admins: (roles ?? []).filter((r) => r.role === "admin" || r.role === "super_admin").length,
    paidOrders: paid.length,
    revenueCents: paid.reduce((sum, o) => sum + o.amount_cents, 0),
    leads: (leads ?? []).length,
    accessCount: (access ?? []).length,
    products: (products ?? []).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      status: p.status,
      isCoproduction: p.is_coproduction,
      sharePct: Number(p.revenue_share_pct ?? 0),
      buyers: (access ?? []).filter((a) => a.product_id === p.id).length,
      revenueCents: paid
        .filter((o) => o.product_id === p.id)
        .reduce((s, o) => s + o.amount_cents, 0),
    })),
    revenueByDay: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([day, cents]) => ({ day, cents })),
  };
}

function randomPassword(): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
