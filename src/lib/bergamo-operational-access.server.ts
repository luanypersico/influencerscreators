import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { assertSuperAdmin, logAudit } from "./admin.server";
import { getPasswordSetupRedirectUrl } from "./auth-invite.server";

/**
 * Toda a lógica deste módulo é preparação operacional — nenhuma função
 * aqui ativa checkout, webhook ou payment_integrations. As duas origens
 * de product_access usadas ('manual_validation' e 'coproducer_preview')
 * são explícitas e nunca poderiam ser confundidas com uma compra real
 * ('purchase'/'hotmart').
 */

async function resolveBergamoProductId(): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", "bergamo")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Produto Bergamo não encontrado.");
  return data.id;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Um usuário só pode ser (re)usado como conta de validação quando é
 * comprovadamente dedicado a isso — nunca reaproveita uma conta com
 * qualquer histórico comercial ou papel de equipe. Isso vale tanto para
 * decidir se um e-mail existente pode virar a conta de validação quanto
 * para decidir se essa conta pode ser excluída do Auth: nenhuma role,
 * nenhum vínculo de colaborador, nenhum pedido (orders), nenhum
 * product_access fora do par (Bergamo, source = manual_validation).
 * Um comprador real do Bergamo (source 'hotmart'/'purchase'/'manual'/
 * 'trial'/'gift'/'coproducer_preview') ou de qualquer outro produto
 * nunca passa por esta checagem.
 */
async function assertUserIsExclusiveToValidation(
  userId: string,
  bergamoProductId: string,
): Promise<void> {
  const [{ data: roles }, { data: collaborator }, { data: orders }, { data: access }] =
    await Promise.all([
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
      supabaseAdmin.from("product_collaborators").select("id").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("orders").select("id").eq("user_id", userId).limit(1),
      supabaseAdmin.from("product_access").select("product_id, source").eq("user_id", userId),
    ]);

  const hasElevatedRole = (roles ?? []).length > 0;
  const hasCollaboratorLink = Boolean(collaborator);
  const hasCommercialOrder = (orders ?? []).length > 0;
  const hasForeignAccess = (access ?? []).some(
    (row) => row.product_id !== bergamoProductId || row.source !== "manual_validation",
  );

  if (hasElevatedRole || hasCollaboratorLink || hasCommercialOrder || hasForeignAccess) {
    throw new Error("Use um e-mail exclusivo para a conta de validação.");
  }
}

// =====================================================================
// PARTE 1 — Conta exclusiva de validação da Hotmart
// =====================================================================

export interface ProvisionHotmartValidationAccountParams {
  actorId: string;
  email: string;
  password: string;
  label: string;
  confirmEmail: boolean;
  confirmEmailReason?: string | null | undefined;
  expiresAt?: string | null | undefined;
  confirmOperation: boolean;
}

export interface HotmartValidationAccountResult {
  userId: string;
  email: string;
  label: string;
  emailConfirmed: boolean;
  expiresAt: string | null;
  restored: boolean;
}

/**
 * Cria ou localiza (por e-mail normalizado) uma conta exclusiva para a
 * validação do fluxo de compra na Hotmart. Nunca recebe user_roles, nunca
 * recebe product_collaborators, nunca ganha acesso a outro produto além
 * do Bergamo. A senha é obrigatória como entrada e NUNCA aparece no
 * retorno nem na auditoria.
 */
export async function provisionHotmartValidationAccount(
  params: ProvisionHotmartValidationAccountParams,
): Promise<HotmartValidationAccountResult> {
  await assertSuperAdmin(params.actorId);

  if (!params.confirmOperation) {
    throw new Error("Confirmação explícita obrigatória para provisionar a conta de validação.");
  }
  const email = normalizeEmail(params.email);
  if (!email.includes("@")) throw new Error("Informe um e-mail válido.");
  if (!params.password || params.password.length < 12) {
    throw new Error("A senha inicial precisa ter pelo menos 12 caracteres.");
  }
  const label = params.label.trim();
  if (!label) throw new Error("Informe um nome identificador para a conta.");
  if (params.confirmEmail && !params.confirmEmailReason?.trim()) {
    throw new Error(
      "Confirmar o e-mail automaticamente exige justificar o motivo (fica registrado na auditoria).",
    );
  }

  const productId = await resolveBergamoProductId();

  const { data: existingId, error: lookupError } = await supabaseAdmin.rpc(
    "find_user_id_by_email",
    { _email: email },
  );
  if (lookupError) throw new Error(lookupError.message);

  let userId: string;
  let restored = false;

  if (existingId) {
    await assertUserIsExclusiveToValidation(existingId, productId);
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(existingId, {
      password: params.password,
      email_confirm: params.confirmEmail,
    });
    if (authError) throw new Error(authError.message);
    userId = existingId;
    restored = true;
  } else {
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: params.password,
      email_confirm: params.confirmEmail,
      user_metadata: { full_name: label },
    });
    if (authError || !data.user) {
      throw new Error(authError?.message ?? "Não foi possível criar a conta de validação.");
    }
    userId = data.user.id;
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, email, full_name: label });
  if (profileError) throw new Error(profileError.message);

  const expiresAt = params.expiresAt ?? null;
  const { data: existingAccess, error: accessLookupError } = await supabaseAdmin
    .from("product_access")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (accessLookupError) throw new Error(accessLookupError.message);

  if (existingAccess) {
    const { error } = await supabaseAdmin
      .from("product_access")
      .update({
        source: "manual_validation",
        granted_by: params.actorId,
        expires_at: expiresAt,
        revoked_at: null,
        suspended_at: null,
        status_reason: "manual_validation",
      })
      .eq("id", existingAccess.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("product_access").insert({
      user_id: userId,
      product_id: productId,
      source: "manual_validation",
      granted_by: params.actorId,
      expires_at: expiresAt,
      status_reason: "manual_validation",
    });
    if (error) throw new Error(error.message);
  }

  await logAudit({
    actorId: params.actorId,
    action: restored
      ? "bergamo.validation_account.reprovision"
      : "bergamo.validation_account.provision",
    entity: "product_access",
    entityId: `${userId}:${productId}`,
    meta: {
      email,
      label,
      emailConfirmed: params.confirmEmail,
      confirmEmailReason: params.confirmEmailReason ?? null,
      expiresAt,
    },
  });

  return { userId, email, label, emailConfirmed: params.confirmEmail, expiresAt, restored };
}

/** Revoga só o product_access — nunca toca no usuário do Auth. Recusa
 * revogar qualquer acesso que não tenha sido concedido por esta função
 * (nunca uma compra real por engano). */
export async function revokeHotmartValidationAccess(params: {
  actorId: string;
  userId: string;
}): Promise<void> {
  await assertSuperAdmin(params.actorId);
  const productId = await resolveBergamoProductId();

  const { data: access, error } = await supabaseAdmin
    .from("product_access")
    .select("id, source")
    .eq("user_id", params.userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!access || access.source !== "manual_validation") {
    throw new Error("Este acesso não é uma conta de validação da Hotmart.");
  }

  const { error: updError } = await supabaseAdmin
    .from("product_access")
    .update({
      revoked_at: new Date().toISOString(),
      suspended_at: null,
      status_reason: "validation_revoked",
    })
    .eq("id", access.id);
  if (updError) throw new Error(updError.message);

  await logAudit({
    actorId: params.actorId,
    action: "bergamo.validation_account.revoke_access",
    entity: "product_access",
    entityId: `${params.userId}:${productId}`,
  });
}

/**
 * Exclusão do usuário do Auth — sempre uma segunda confirmação explícita,
 * separada da revogação de acesso. Recusa excluir qualquer conta que
 * tenha qualquer histórico comercial (pedido, acesso comprado, acesso a
 * outro produto, role, vínculo de colaborador) — só exclui uma conta
 * cujo ÚNICO product_access existente seja (Bergamo, manual_validation).
 * Antes de excluir o usuário do Auth, revoga esse acesso de validação e
 * registra a auditoria; nunca apaga pedido, nunca apaga acesso comprado,
 * nunca apaga um usuário real de cliente.
 */
export async function deleteHotmartValidationUser(params: {
  actorId: string;
  userId: string;
  confirmDeleteAuthUser: boolean;
}): Promise<void> {
  await assertSuperAdmin(params.actorId);
  if (!params.confirmDeleteAuthUser) {
    throw new Error("Confirmação explícita obrigatória para excluir a conta de validação do Auth.");
  }
  const productId = await resolveBergamoProductId();

  const [
    { data: allAccess, error: accessError },
    { data: roles },
    { data: collaborator },
    { data: orders },
  ] = await Promise.all([
    supabaseAdmin
      .from("product_access")
      .select("id, product_id, source")
      .eq("user_id", params.userId),
    supabaseAdmin.from("user_roles").select("role").eq("user_id", params.userId),
    supabaseAdmin
      .from("product_collaborators")
      .select("id")
      .eq("user_id", params.userId)
      .maybeSingle(),
    supabaseAdmin.from("orders").select("id").eq("user_id", params.userId).limit(1),
  ]);
  if (accessError) throw new Error(accessError.message);

  const validationAccessRows = (allAccess ?? []).filter(
    (row) => row.product_id === productId && row.source === "manual_validation",
  );
  const hasForeignAccess = (allAccess ?? []).some(
    (row) => row.product_id !== productId || row.source !== "manual_validation",
  );

  if (validationAccessRows.length === 0) {
    throw new Error("Este usuário não é uma conta de validação da Hotmart.");
  }
  if (hasForeignAccess || (roles ?? []).length > 0 || collaborator || (orders ?? []).length > 0) {
    throw new Error(
      "Esta conta tem histórico comercial, papel administrativo ou vínculo de colaborador — exclusão bloqueada.",
    );
  }

  for (const row of validationAccessRows) {
    const { error: revokeError } = await supabaseAdmin
      .from("product_access")
      .update({ revoked_at: new Date().toISOString(), status_reason: "validation_deleted" })
      .eq("id", row.id);
    if (revokeError) throw new Error(revokeError.message);
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(params.userId);
  if (error) throw new Error(error.message);

  await logAudit({
    actorId: params.actorId,
    action: "bergamo.validation_account.delete_user",
    entity: "user",
    entityId: params.userId,
  });
}

export interface HotmartValidationAccountRow {
  userId: string;
  email: string;
  label: string | null;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

/** Lista para o painel administrativo — nunca inclui senha, nunca inclui
 * qualquer segredo. Identifica as contas de validação só pelo `source`. */
export async function listHotmartValidationAccounts(
  actorId: string,
): Promise<HotmartValidationAccountRow[]> {
  await assertSuperAdmin(actorId);
  const productId = await resolveBergamoProductId();

  const { data: accessRows, error } = await supabaseAdmin
    .from("product_access")
    .select("user_id, created_at, expires_at, revoked_at")
    .eq("product_id", productId)
    .eq("source", "manual_validation")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const userIds = (accessRows ?? []).map((r) => r.user_id);
  const profileMap = new Map<string, { email: string; full_name: string | null }>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);
    for (const p of profiles ?? [])
      profileMap.set(p.id, { email: p.email, full_name: p.full_name });
  }

  return (accessRows ?? []).map((row) => ({
    userId: row.user_id,
    email: profileMap.get(row.user_id)?.email ?? "—",
    label: profileMap.get(row.user_id)?.full_name ?? null,
    active: !row.revoked_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
  }));
}

// =====================================================================
// PARTE 3 — Vínculo do coprodutor real do Bergamo
// =====================================================================

export interface LinkBergamoCoproducerResult {
  userId: string;
  email: string;
  restored: boolean;
  invited: boolean;
}

/**
 * Localiza (por e-mail normalizado) ou convida o usuário real do
 * coprodutor e garante um vínculo `coproducer` ativo em
 * product_collaborators, escopado só ao Bergamo. Idempotente: repetir a
 * chamada nunca duplica o vínculo nem o usuário, e um vínculo revogado é
 * restaurado (nunca recriado como uma segunda linha). Nunca cria papel
 * global (user_roles) e nunca concede acesso a outro produto.
 */
export async function linkBergamoCoproducer(params: {
  actorId: string;
  email: string;
}): Promise<LinkBergamoCoproducerResult> {
  await assertSuperAdmin(params.actorId);
  const email = normalizeEmail(params.email);
  if (!email.includes("@")) throw new Error("Informe um e-mail válido.");

  const productId = await resolveBergamoProductId();

  const { data: existingId, error: lookupError } = await supabaseAdmin.rpc(
    "find_user_id_by_email",
    { _email: email },
  );
  if (lookupError) throw new Error(lookupError.message);

  let userId: string;
  let invited = false;

  if (existingId) {
    userId = existingId;
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: getPasswordSetupRedirectUrl(),
    });
    if (error || !data.user) {
      throw new Error(error?.message ?? "Não foi possível convidar o coprodutor.");
    }
    userId = data.user.id;
    invited = true;
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({ id: userId, email });
  if (profileError) throw new Error(profileError.message);

  const { data: existingLink, error: linkLookupError } = await supabaseAdmin
    .from("product_collaborators")
    .select("id, status")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();
  if (linkLookupError) throw new Error(linkLookupError.message);

  const restored = Boolean(existingLink && existingLink.status === "revoked");

  if (existingLink) {
    const { error } = await supabaseAdmin
      .from("product_collaborators")
      .update({ role: "coproducer", status: "active", revoked_at: null })
      .eq("id", existingLink.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("product_collaborators").insert({
      product_id: productId,
      user_id: userId,
      role: "coproducer",
      status: "active",
      created_by: params.actorId,
    });
    if (error) throw new Error(error.message);
  }

  await logAudit({
    actorId: params.actorId,
    action: restored ? "bergamo.coproducer.restore" : "bergamo.coproducer.link",
    entity: "product_collaborators",
    entityId: `${productId}:${userId}`,
    meta: { email, invited },
  });

  return { userId, email, restored, invited };
}

/** Revoga o vínculo (nunca exclui a linha — pode ser restaurado depois
 * por linkBergamoCoproducer). Nunca concede/revoga user_roles. */
export async function revokeBergamoCoproducerLink(params: {
  actorId: string;
  userId: string;
}): Promise<void> {
  await assertSuperAdmin(params.actorId);
  const productId = await resolveBergamoProductId();

  const { data: existingLink, error } = await supabaseAdmin
    .from("product_collaborators")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!existingLink) throw new Error("Vínculo de coprodutor não encontrado.");

  const { error: updError } = await supabaseAdmin
    .from("product_collaborators")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", existingLink.id);
  if (updError) throw new Error(updError.message);

  await logAudit({
    actorId: params.actorId,
    action: "bergamo.coproducer.revoke",
    entity: "product_collaborators",
    entityId: `${productId}:${params.userId}`,
  });
}

export interface BergamoCoproducerRow {
  userId: string;
  email: string;
  status: "active" | "revoked";
  linkedAt: string;
  revokedAt: string | null;
  memberPreviewActive: boolean;
}

export async function listBergamoCoproducers(actorId: string): Promise<BergamoCoproducerRow[]> {
  await assertSuperAdmin(actorId);
  const productId = await resolveBergamoProductId();

  const { data: links, error } = await supabaseAdmin
    .from("product_collaborators")
    .select("user_id, status, created_at, revoked_at")
    .eq("product_id", productId)
    .eq("role", "coproducer")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const userIds = (links ?? []).map((l) => l.user_id);
  const profileMap = new Map<string, string>();
  const previewSet = new Set<string>();
  if (userIds.length > 0) {
    const [{ data: profiles }, { data: previewAccess }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, email").in("id", userIds),
      supabaseAdmin
        .from("product_access")
        .select("user_id")
        .eq("product_id", productId)
        .eq("source", "coproducer_preview")
        .is("revoked_at", null)
        .in("user_id", userIds),
    ]);
    for (const p of profiles ?? []) profileMap.set(p.id, p.email);
    for (const a of previewAccess ?? []) previewSet.add(a.user_id);
  }

  return (links ?? []).map((l) => ({
    userId: l.user_id,
    email: profileMap.get(l.user_id) ?? "—",
    status: l.status as "active" | "revoked",
    linkedAt: l.created_at,
    revokedAt: l.revoked_at,
    memberPreviewActive: previewSet.has(l.user_id),
  }));
}

// =====================================================================
// PARTE 4 — Pré-visualização opcional da área de membros (coprodutor)
// =====================================================================

/**
 * Liga/desliga um product_access de origem 'coproducer_preview' para um
 * coprodutor já vinculado — sempre uma ação separada e explícita do
 * super_admin, nunca automática ao vincular. Nunca cria nem revoga acesso
 * concedido por outra origem (nunca mexe numa compra real).
 */
export async function setBergamoCoproducerMemberPreview(params: {
  actorId: string;
  userId: string;
  enabled: boolean;
}): Promise<void> {
  await assertSuperAdmin(params.actorId);
  const productId = await resolveBergamoProductId();

  const { data: link, error: linkError } = await supabaseAdmin
    .from("product_collaborators")
    .select("id, status")
    .eq("product_id", productId)
    .eq("user_id", params.userId)
    .eq("role", "coproducer")
    .maybeSingle();
  if (linkError) throw new Error(linkError.message);
  if (!link || link.status !== "active") {
    throw new Error("Só é possível conceder pré-visualização a um coprodutor com vínculo ativo.");
  }

  const { data: existingAccess, error: lookupError } = await supabaseAdmin
    .from("product_access")
    .select("id, source")
    .eq("user_id", params.userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);

  if (params.enabled) {
    if (existingAccess && existingAccess.source !== "coproducer_preview") {
      throw new Error(
        "Este usuário já tem outro tipo de acesso ao Bergamo — ajuste manualmente em Usuários & acessos antes de conceder a pré-visualização.",
      );
    }
    if (existingAccess) {
      const { error } = await supabaseAdmin
        .from("product_access")
        .update({
          revoked_at: null,
          suspended_at: null,
          granted_by: params.actorId,
          status_reason: "coproducer_preview",
        })
        .eq("id", existingAccess.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("product_access").insert({
        user_id: params.userId,
        product_id: productId,
        source: "coproducer_preview",
        granted_by: params.actorId,
        status_reason: "coproducer_preview",
      });
      if (error) throw new Error(error.message);
    }
  } else if (existingAccess && existingAccess.source === "coproducer_preview") {
    const { error } = await supabaseAdmin
      .from("product_access")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", existingAccess.id);
    if (error) throw new Error(error.message);
  }

  await logAudit({
    actorId: params.actorId,
    action: params.enabled
      ? "bergamo.coproducer.preview_grant"
      : "bergamo.coproducer.preview_revoke",
    entity: "product_access",
    entityId: `${params.userId}:${productId}`,
  });
}
