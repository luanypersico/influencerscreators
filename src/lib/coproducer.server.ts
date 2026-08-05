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
  name: string | null;
  email: string;
  purchasedAt: string | null;
  orderStatus: string;
  accessStatus: "active" | "suspended" | "revoked" | "none";
}

export async function listBergamoCustomers(userId: string): Promise<BergamoCustomerRow[]> {
  const { productId } = await assertBergamoAccess(userId);

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("user_id, buyer_email, buyer_name, status, paid_at, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const userIds = Array.from(
    new Set((orders ?? []).map((o) => o.user_id).filter(Boolean)),
  ) as string[];

  const accessByUser = new Map<
    string,
    { revoked_at: string | null; suspended_at: string | null }
  >();
  if (userIds.length > 0) {
    const { data: accessRows } = await supabaseAdmin
      .from("product_access")
      .select("user_id, revoked_at, suspended_at")
      .eq("product_id", productId)
      .in("user_id", userIds);
    for (const row of accessRows ?? []) {
      accessByUser.set(row.user_id, { revoked_at: row.revoked_at, suspended_at: row.suspended_at });
    }
  }

  return (orders ?? []).map((order) => {
    const access = order.user_id ? accessByUser.get(order.user_id) : undefined;
    let accessStatus: BergamoCustomerRow["accessStatus"] = "none";
    if (access) {
      if (access.revoked_at) accessStatus = "revoked";
      else if (access.suspended_at) accessStatus = "suspended";
      else accessStatus = "active";
    }
    return {
      name: order.buyer_name,
      email: order.buyer_email,
      purchasedAt: order.paid_at ?? order.created_at,
      orderStatus: order.status,
      accessStatus,
    };
  });
}

// ---------------------------------------------------------------------
// C. Prompts — criar/editar/categorizar/ordenar/publicar/arquivar.
// Nunca hard delete. Toda mutação gera uma revisão em
// product_item_revisions antes de seguir em frente.
// ---------------------------------------------------------------------
export type PromptStatus = "draft" | "published" | "archived";

export interface CoproducerPromptRow {
  id: string;
  code: string | null;
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
    .select("id, code, title, category, description, prompt, status, sort_order, updated_at")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
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
  title?: string | undefined;
  category?: string | null | undefined;
  description?: string | null | undefined;
  prompt?: string | null | undefined;
}): Promise<void> {
  const { productId } = await assertBergamoAccess(params.actorId);
  await assertItemBelongsToBergamo(params.itemId, productId);

  const patch: ProductItemsUpdate = { updated_by: params.actorId };
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
