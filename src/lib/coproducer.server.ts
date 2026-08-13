import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

import { logAudit } from "./admin.server";

type ProductItemsUpdate = Database["public"]["Tables"]["product_items"]["Update"];
type ProductUpdatesUpdate = Database["public"]["Tables"]["product_updates"]["Update"];

/**
 * Autorização do workspace do coprodutor: super_admin OU vínculo ativo
 * como 'coproducer' no product_collaborators do Bergamo especificamente.
 * Nunca confia em nada vindo do cliente — sempre relê do banco.
 */
async function assertBergamoAccess(userId: string): Promise<{ productId: string }> {
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", "bergamo")
    .maybeSingle();
  if (!product) throw new Error("Produto Bergamo não encontrado.");

  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const isSuperAdmin = (roles ?? []).some((r) => r.role === "super_admin");
  if (isSuperAdmin) return { productId: product.id };

  const { data: collaborator, error } = await supabaseAdmin
    .from("product_collaborators")
    .select("role, status")
    .eq("product_id", product.id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!collaborator || collaborator.role !== "coproducer") {
    throw new Error("Acesso restrito ao coprodutor do Bergamo.");
  }
  return { productId: product.id };
}

/**
 * Autoriza somente a operacao de cortesia: administradores globais ou o
 * coprodutor ativo do Bergamo. O produto e sempre resolvido pelo slug no
 * servidor; nenhum product_id vindo do navegador participa da decisao.
 */
async function assertBergamoCourtesyManager(userId: string): Promise<{ productId: string }> {
  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", "bergamo")
    .maybeSingle();
  if (productError) throw new Error(productError.message);
  if (!product) throw new Error("Produto Bergamo não encontrado.");

  const { data: roles, error: rolesError } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (rolesError) throw new Error(rolesError.message);
  if ((roles ?? []).some((row) => row.role === "super_admin" || row.role === "admin")) {
    return { productId: product.id };
  }

  const { data: collaborator, error: collaboratorError } = await supabaseAdmin
    .from("product_collaborators")
    .select("id")
    .eq("product_id", product.id)
    .eq("user_id", userId)
    .eq("role", "coproducer")
    .eq("status", "active")
    .maybeSingle();
  if (collaboratorError) throw new Error(collaboratorError.message);
  if (!collaborator) throw new Error("Acesso restrito ao coprodutor ativo do Bergamo.");

  return { productId: product.id };
}

const ARSENAL_ORIGIN = "https://arsenal.obergamo.com.br";

/** Explicit redirect base for Bergamo/Arsenal invitations. */
export function getBergamoInviteRedirectUrl(env?: NodeJS.ProcessEnv): string {
  if (!env) return ARSENAL_ORIGIN;
  const configuredOrigin = env["APP_ORIGIN"]?.trim() || env["CF_PAGES_URL"]?.trim();
  if (!configuredOrigin) return `${ARSENAL_ORIGIN}/auth/invite`;

  const url = new URL(configuredOrigin);
  const isTrustedNonProductionOrigin =
    url.origin === "http://localhost:4173" ||
    (url.protocol === "https:" &&
      url.port === "" &&
      url.hostname.endsWith(".influencerscreators.pages.dev"));

  if (url.username || url.password || !isTrustedNonProductionOrigin) {
    throw new Error("Origem confiável de convite não configurada.");
  }

  return `${url.origin}/auth/invite`;
}

// ---------------------------------------------------------------------
// A. Visão geral
// ---------------------------------------------------------------------
export interface BergamoOverview {
  approvedSales: number;
  pendingOrders: number;
  refunds: number;
  disputes: number;
  activeCustomers: number;
  grossRevenueCents: number;
  priceCents: number;
  currency: string;
  productStatus: string;
}

export async function getBergamoOverview(userId: string): Promise<BergamoOverview> {
  const { productId } = await assertBergamoAccess(userId);

  const [{ data: product }, { data: orders }, { data: access }] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("price_cents, currency, status")
      .eq("id", productId)
      .single(),
    supabaseAdmin.from("orders").select("status, amount_cents").eq("product_id", productId),
    supabaseAdmin
      .from("product_access")
      .select("id")
      .eq("product_id", productId)
      .is("revoked_at", null)
      .is("suspended_at", null),
  ]);

  const rows = orders ?? [];
  const paid = rows.filter((o) => o.status === "paid");
  const pending = rows.filter((o) => o.status === "pending");
  const refunded = rows.filter((o) => o.status === "refunded" || o.status === "chargeback");
  const disputed = rows.filter((o) => o.status === "disputed");

  return {
    approvedSales: paid.length,
    pendingOrders: pending.length,
    refunds: refunded.length,
    disputes: disputed.length,
    activeCustomers: (access ?? []).length,
    grossRevenueCents: paid.reduce((sum, o) => sum + o.amount_cents, 0),
    priceCents: product?.price_cents ?? 0,
    currency: product?.currency ?? "BRL",
    productStatus: product?.status ?? "draft",
  };
}

// ---------------------------------------------------------------------
// B. Clientes — minimização de dados: só o necessário para suporte.
// Nunca telefone, notas internas, payload de webhook, dados de auth.
// Sempre filtrado pelo product_id do Bergamo no servidor.
// ---------------------------------------------------------------------
export interface BergamoCustomerRow {
  userId: string | null;
  name: string | null;
  email: string;
  origin: "purchase" | "manual";
  grantedAt: string;
  accessStatus: "active" | "suspended" | "revoked" | "none";
  canRevokeCourtesy: boolean;
}

export async function listBergamoCustomers(userId: string): Promise<BergamoCustomerRow[]> {
  const { productId } = await assertBergamoAccess(userId);

  const [{ data: orders, error: ordersError }, { data: accessRows, error: accessError }] =
    await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("user_id, buyer_email, buyer_name, paid_at, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("product_access")
        .select("user_id, source, revoked_at, suspended_at, created_at")
        .eq("product_id", productId),
    ]);
  if (ordersError) throw new Error(ordersError.message);
  if (accessError) throw new Error(accessError.message);

  const customerAccess = accessRows ?? [];
  const accessByUser = new Map(customerAccess.map((row) => [row.user_id, row]));
  const accessUserIds = Array.from(new Set(customerAccess.map((row) => row.user_id)));
  const profileByUser = new Map<string, { email: string; full_name: string | null }>();

  if (accessUserIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .in("id", accessUserIds);
    if (profilesError) throw new Error(profilesError.message);
    for (const profile of profiles ?? []) {
      if (profile.email) profileByUser.set(profile.id, profile);
    }
  }

  function statusFor(access: (typeof customerAccess)[number] | undefined) {
    if (!access) return "none" as const;
    if (access.revoked_at) return "revoked" as const;
    if (access.suspended_at) return "suspended" as const;
    return "active" as const;
  }

  const rows = new Map<string, BergamoCustomerRow>();
  for (const order of orders ?? []) {
    const key = order.user_id ?? order.buyer_email.trim().toLowerCase();
    if (rows.has(key)) continue;
    const access = order.user_id ? accessByUser.get(order.user_id) : undefined;
    rows.set(key, {
      userId: order.user_id,
      name: order.buyer_name,
      email: order.buyer_email,
      origin: "purchase",
      grantedAt: order.paid_at ?? order.created_at,
      accessStatus: statusFor(access),
      canRevokeCourtesy: false,
    });
  }

  for (const access of customerAccess) {
    if (access.source !== "manual" || rows.has(access.user_id)) continue;
    const profile = profileByUser.get(access.user_id);
    if (!profile) continue;
    const accessStatus = statusFor(access);
    rows.set(access.user_id, {
      userId: access.user_id,
      name: profile.full_name,
      email: profile.email,
      origin: "manual",
      grantedAt: access.created_at,
      accessStatus,
      canRevokeCourtesy: accessStatus === "active",
    });
  }

  return Array.from(rows.values()).sort((a, b) => b.grantedAt.localeCompare(a.grantedAt));
}

export interface GrantBergamoCourtesyAccessParams {
  actorId: string;
  name: string;
  email: string;
  note?: string | null | undefined;
}

export interface GrantBergamoCourtesyAccessResult {
  userId: string;
  invited: boolean;
  access: "created" | "restored" | "already_active" | "already_has_access";
}

function normalizeCustomerEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function grantBergamoCourtesyAccess(
  params: GrantBergamoCourtesyAccessParams,
): Promise<GrantBergamoCourtesyAccessResult> {
  const { productId } = await assertBergamoCourtesyManager(params.actorId);
  const name = params.name.trim();
  const email = normalizeCustomerEmail(params.email);
  const note = params.note?.trim() || null;

  if (!name || name.length > 120) throw new Error("Informe um nome válido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error("Informe um e-mail válido.");
  }
  if (note && note.length > 500) throw new Error("A observação deve ter no máximo 500 caracteres.");

  const { data: existingUserId, error: lookupError } = await supabaseAdmin.rpc(
    "find_user_id_by_email",
    { _email: email },
  );
  if (lookupError) throw new Error(lookupError.message);

  let userId = existingUserId;
  let invited = false;

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name },
      redirectTo: getBergamoInviteRedirectUrl(),
    });
    if (error || !data.user) {
      throw new Error(error?.message ?? "Não foi possível convidar o cliente.");
    }
    userId = data.user.id;
    invited = true;
  }

  try {
    const { data: profile, error: profileLookupError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("id", userId)
      .maybeSingle();
    if (profileLookupError) throw new Error(profileLookupError.message);

    if (profile) {
      if (!profile.full_name) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ full_name: name })
          .eq("id", userId);
        if (error) throw new Error(error.message);
      }
    } else {
      const { error } = await supabaseAdmin
        .from("profiles")
        .insert({ id: userId, email, full_name: name });
      if (error) throw new Error(error.message);
    }

    if (invited) {
      const { data: roles, error: rolesError } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (rolesError) throw new Error(rolesError.message);
      const roleNames = (roles ?? []).map((row) => row.role);
      if (
        !roleNames.includes("member") ||
        roleNames.some((role) => role === "admin" || role === "super_admin")
      ) {
        throw new Error("O fluxo padrão de profile/member não foi concluído.");
      }
    }

    const [
      { data: existingAccess, error: accessLookupError },
      { data: commercialOrders, error: ordersError },
    ] = await Promise.all([
      supabaseAdmin
        .from("product_access")
        .select("id, source, revoked_at, suspended_at")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle(),
      supabaseAdmin
        .from("orders")
        .select("id")
        .eq("product_id", productId)
        .eq("user_id", userId)
        .limit(1),
    ]);
    if (accessLookupError) throw new Error(accessLookupError.message);
    if (ordersError) throw new Error(ordersError.message);

    let access: GrantBergamoCourtesyAccessResult["access"];
    let auditSource = "manual";
    if ((commercialOrders ?? []).length > 0) {
      if (existingAccess && !existingAccess.revoked_at && !existingAccess.suspended_at) {
        access = "already_has_access";
        auditSource = existingAccess.source;
      } else {
        throw new Error("Uma compra comercial não pode ser convertida em cortesia.");
      }
    } else if (existingAccess) {
      if (existingAccess.source !== "manual") {
        if (!existingAccess.revoked_at && !existingAccess.suspended_at) {
          access = "already_has_access";
          auditSource = existingAccess.source;
        } else {
          throw new Error("Um acesso de outra origem não pode ser convertido em cortesia.");
        }
      } else if (!existingAccess.revoked_at && !existingAccess.suspended_at) {
        access = "already_active";
      } else {
        const { error } = await supabaseAdmin
          .from("product_access")
          .update({
            granted_by: params.actorId,
            revoked_at: null,
            suspended_at: null,
            status_reason: "manual_courtesy",
          })
          .eq("id", existingAccess.id)
          .eq("source", "manual");
        if (error) throw new Error(error.message);
        access = "restored";
      }
    } else {
      const { error } = await supabaseAdmin.from("product_access").insert({
        user_id: userId,
        product_id: productId,
        source: "manual",
        granted_by: params.actorId,
        status_reason: "manual_courtesy",
      });
      if (error) throw new Error(error.message);
      access = "created";
    }

    await logAudit({
      actorId: params.actorId,
      action:
        access === "already_has_access"
          ? "bergamo.courtesy_access.skip_existing"
          : "bergamo.courtesy_access.grant",
      entity: "product_access",
      entityId: `${productId}:${userId}`,
      meta: { targetUserId: userId, productId, source: auditSource, note, invited, result: access },
    });

    return { userId, invited, access };
  } catch (error) {
    if (invited) await supabaseAdmin.auth.admin.deleteUser(userId);
    throw error;
  }
}

export async function revokeBergamoCourtesyAccess(params: {
  actorId: string;
  userId: string;
}): Promise<{ alreadyRevoked: boolean }> {
  const { productId } = await assertBergamoCourtesyManager(params.actorId);
  const { data: access, error: accessError } = await supabaseAdmin
    .from("product_access")
    .select("id, source, revoked_at")
    .eq("user_id", params.userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (accessError) throw new Error(accessError.message);
  if (!access || access.source !== "manual") {
    throw new Error("Somente acessos de cortesia podem ser revogados por este workspace.");
  }

  const { data: commercialOrders, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", params.userId)
    .limit(1);
  if (ordersError) throw new Error(ordersError.message);
  if ((commercialOrders ?? []).length > 0) {
    throw new Error("Acesso ligado a uma compra comercial não pode ser revogado como cortesia.");
  }

  if (access.revoked_at) return { alreadyRevoked: true };

  const { error } = await supabaseAdmin
    .from("product_access")
    .update({
      revoked_at: new Date().toISOString(),
      suspended_at: null,
      status_reason: "manual_courtesy_revoked",
    })
    .eq("id", access.id)
    .eq("source", "manual");
  if (error) throw new Error(error.message);

  await logAudit({
    actorId: params.actorId,
    action: "bergamo.courtesy_access.revoke",
    entity: "product_access",
    entityId: `${productId}:${params.userId}`,
    meta: { targetUserId: params.userId, productId, source: "manual" },
  });

  return { alreadyRevoked: false };
}

// ---------------------------------------------------------------------
// C. Prompts — criar/editar/categorizar/ordenar/publicar/arquivar.
// Nunca hard delete. Toda mutação gera uma revisão em
// product_item_revisions antes de seguir em frente.
// ---------------------------------------------------------------------
export type PromptStatus = "draft" | "published" | "archived";

export interface CoproducerPromptRow {
  id: string;
  code?: string | null;
  isFree?: boolean;
  title: string;
  category: string | null;
  description: string | null;
  prompt: string | null;
  status: PromptStatus;
  sortOrder: number;
  updatedAt: string;
}

export async function listBergamoPrompts(userId: string): Promise<CoproducerPromptRow[]> {
  const { productId } = await assertBergamoAccess(userId);
  const { data, error } = await supabaseAdmin
    .from("product_items")
    .select(
      "id, code, title, category, description, prompt, is_free, status, sort_order, updated_at",
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    isFree: row.is_free,
    title: row.title,
    category: row.category,
    description: row.description,
    prompt: row.prompt,
    status: row.status as PromptStatus,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  }));
}

async function snapshotPromptRevision(
  itemId: string,
  changedBy: string,
  reason: string,
): Promise<void> {
  const { data: item } = await supabaseAdmin
    .from("product_items")
    .select("title, category, description, prompt, status")
    .eq("id", itemId)
    .maybeSingle();
  if (!item) return;

  const { data: last } = await supabaseAdmin
    .from("product_item_revisions")
    .select("version")
    .eq("item_id", itemId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = (last?.version ?? 0) + 1;

  await supabaseAdmin.from("product_item_revisions").insert({
    item_id: itemId,
    version: nextVersion,
    title: item.title,
    category: item.category,
    description: item.description,
    prompt: item.prompt,
    status: item.status,
    changed_by: changedBy,
    reason,
  });
}

async function assertItemBelongsToBergamo(itemId: string, productId: string): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from("product_items")
    .select("id, product_id")
    .eq("id", itemId)
    .maybeSingle();
  if (!existing || existing.product_id !== productId) {
    throw new Error("Item não encontrado no Bergamo.");
  }
}

export async function createBergamoPrompt(params: {
  actorId: string;
  code?: string | null;
  isFree?: boolean;
  title: string;
  category: string | null;
  description: string | null;
  prompt: string | null;
}): Promise<string> {
  const { productId } = await assertBergamoAccess(params.actorId);

  const { data: maxRow } = await supabaseAdmin
    .from("product_items")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from("product_items")
    .insert({
      product_id: productId,
      item_type: "prompt",
      code: params.code ?? null,
      is_free: params.isFree ?? false,
      title: params.title,
      category: params.category,
      description: params.description,
      prompt: params.prompt,
      status: "draft",
      sort_order: nextOrder,
      created_by: params.actorId,
      updated_by: params.actorId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await snapshotPromptRevision(data.id, params.actorId, "criação");
  await logAudit({
    actorId: params.actorId,
    action: "prompt.create",
    entity: "product_items",
    entityId: data.id,
    meta: { product: "bergamo", title: params.title },
  });
  return data.id;
}

export async function updateBergamoPrompt(params: {
  actorId: string;
  itemId: string;
  code?: string | null | undefined;
  isFree?: boolean | undefined;
  title?: string | undefined;
  category?: string | null | undefined;
  description?: string | null | undefined;
  prompt?: string | null | undefined;
}): Promise<void> {
  const { productId } = await assertBergamoAccess(params.actorId);
  await assertItemBelongsToBergamo(params.itemId, productId);

  const patch: ProductItemsUpdate = { updated_by: params.actorId };
  if (params.code !== undefined) patch.code = params.code;
  if (params.isFree !== undefined) patch.is_free = params.isFree;
  if (params.title !== undefined) patch.title = params.title;
  if (params.category !== undefined) patch.category = params.category;
  if (params.description !== undefined) patch.description = params.description;
  if (params.prompt !== undefined) patch.prompt = params.prompt;

  const { error } = await supabaseAdmin.from("product_items").update(patch).eq("id", params.itemId);
  if (error) throw new Error(error.message);

  await snapshotPromptRevision(params.itemId, params.actorId, "edição");
  await logAudit({
    actorId: params.actorId,
    action: "prompt.update",
    entity: "product_items",
    entityId: params.itemId,
    meta: { product: "bergamo", fields: Object.keys(patch).filter((k) => k !== "updated_by") },
  });
}

export async function setBergamoPromptStatus(params: {
  actorId: string;
  itemId: string;
  status: PromptStatus;
}): Promise<void> {
  const { productId } = await assertBergamoAccess(params.actorId);
  await assertItemBelongsToBergamo(params.itemId, productId);

  const patch: ProductItemsUpdate = { status: params.status, updated_by: params.actorId };
  if (params.status === "published") patch.published_at = new Date().toISOString();

  const { error } = await supabaseAdmin.from("product_items").update(patch).eq("id", params.itemId);
  if (error) throw new Error(error.message);

  await snapshotPromptRevision(params.itemId, params.actorId, params.status);
  await logAudit({
    actorId: params.actorId,
    action: `prompt.${params.status}`,
    entity: "product_items",
    entityId: params.itemId,
    meta: { product: "bergamo" },
  });
}

export async function reorderBergamoPrompts(params: {
  actorId: string;
  orderedIds: string[];
}): Promise<void> {
  const { productId } = await assertBergamoAccess(params.actorId);

  const { data: rows } = await supabaseAdmin
    .from("product_items")
    .select("id, product_id")
    .in("id", params.orderedIds);
  const allBelong =
    (rows ?? []).length === params.orderedIds.length &&
    (rows ?? []).every((row) => row.product_id === productId);
  if (!allBelong) throw new Error("Itens inválidos para reordenar.");

  await Promise.all(
    params.orderedIds.map((id, index) =>
      supabaseAdmin
        .from("product_items")
        .update({ sort_order: index + 1, updated_by: params.actorId })
        .eq("id", id),
    ),
  );

  await logAudit({
    actorId: params.actorId,
    action: "prompt.reorder",
    entity: "product_items",
    entityId: productId,
    meta: { product: "bergamo", count: params.orderedIds.length },
  });
}

export interface PromptRevisionRow {
  version: number;
  title: string;
  status: string;
  changedBy: string | null;
  reason: string | null;
  createdAt: string;
}

export async function listBergamoPromptRevisions(
  userId: string,
  itemId: string,
): Promise<PromptRevisionRow[]> {
  const { productId } = await assertBergamoAccess(userId);
  await assertItemBelongsToBergamo(itemId, productId);

  const { data, error } = await supabaseAdmin
    .from("product_item_revisions")
    .select("version, title, status, changed_by, reason, created_at")
    .eq("item_id", itemId)
    .order("version", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    version: row.version,
    title: row.title,
    status: row.status,
    changedBy: row.changed_by,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

// ---------------------------------------------------------------------
// D. Atualizações do produto
// ---------------------------------------------------------------------
export type UpdateStatus = "draft" | "published" | "archived";

export interface CoproducerUpdateRow {
  id: string;
  title: string;
  content: string;
  status: UpdateStatus;
  publishedAt: string | null;
  createdAt: string;
}

export async function listBergamoUpdates(userId: string): Promise<CoproducerUpdateRow[]> {
  const { productId } = await assertBergamoAccess(userId);
  const { data, error } = await supabaseAdmin
    .from("product_updates")
    .select("id, title, content, status, published_at, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    status: row.status as UpdateStatus,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }));
}

async function assertUpdateBelongsToBergamo(updateId: string, productId: string): Promise<void> {
  const { data: existing } = await supabaseAdmin
    .from("product_updates")
    .select("id, product_id")
    .eq("id", updateId)
    .maybeSingle();
  if (!existing || existing.product_id !== productId) {
    throw new Error("Atualização não encontrada no Bergamo.");
  }
}

export async function createBergamoUpdate(params: {
  actorId: string;
  title: string;
  content: string;
}): Promise<string> {
  const { productId } = await assertBergamoAccess(params.actorId);
  const { data, error } = await supabaseAdmin
    .from("product_updates")
    .insert({
      product_id: productId,
      title: params.title,
      content: params.content,
      status: "draft",
      created_by: params.actorId,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await logAudit({
    actorId: params.actorId,
    action: "update.create",
    entity: "product_updates",
    entityId: data.id,
    meta: { product: "bergamo" },
  });
  return data.id;
}

export async function updateBergamoUpdate(params: {
  actorId: string;
  updateId: string;
  title?: string | undefined;
  content?: string | undefined;
}): Promise<void> {
  const { productId } = await assertBergamoAccess(params.actorId);
  await assertUpdateBelongsToBergamo(params.updateId, productId);

  const patch: ProductUpdatesUpdate = {};
  if (params.title !== undefined) patch.title = params.title;
  if (params.content !== undefined) patch.content = params.content;

  const { error } = await supabaseAdmin
    .from("product_updates")
    .update(patch)
    .eq("id", params.updateId);
  if (error) throw new Error(error.message);

  await logAudit({
    actorId: params.actorId,
    action: "update.edit",
    entity: "product_updates",
    entityId: params.updateId,
    meta: { product: "bergamo" },
  });
}

export async function setBergamoUpdateStatus(params: {
  actorId: string;
  updateId: string;
  status: UpdateStatus;
}): Promise<void> {
  const { productId } = await assertBergamoAccess(params.actorId);
  await assertUpdateBelongsToBergamo(params.updateId, productId);

  const patch: ProductUpdatesUpdate = { status: params.status };
  if (params.status === "published") patch.published_at = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("product_updates")
    .update(patch)
    .eq("id", params.updateId);
  if (error) throw new Error(error.message);

  await logAudit({
    actorId: params.actorId,
    action: `update.${params.status}`,
    entity: "product_updates",
    entityId: params.updateId,
    meta: { product: "bergamo" },
  });
}
