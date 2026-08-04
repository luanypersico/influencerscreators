import { getRequest } from "@tanstack/react-start/server";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { assertSuperAdmin, logAudit } from "./admin.server";

const WEBHOOK_PATH = "/api/public/webhooks/hotmart";

/**
 * Contrato seguro para o navegador. Nunca inclui o Hottok, nem uma
 * derivação dele (tamanho, prefixo, sufixo, valor mascarado) — só um
 * booleano indicando se o secret do ambiente está presente.
 */
export interface BergamoIntegrationClientView {
  id: string;
  provider: "hotmart";
  environment: string;
  external_product_ucode: string | null;
  external_product_id: string | null;
  external_offer_id: string | null;
  active: boolean;
  updated_at: string;
  hottok_configured: boolean;
  webhook_url: string;
}

export interface BergamoWebhookEventRow {
  id: string;
  event_type: string;
  purchase_status: string | null;
  transaction_ref: string | null;
  processing_status: string;
  created_at: string;
}

/** Único indicador de segredo permitido a cruzar para o cliente. */
function isHottokConfigured(): boolean {
  return Boolean(process.env["HOTMART_HOTTOK"]?.trim());
}

function buildWebhookUrl(): string {
  try {
    const request = getRequest();
    const host = request?.headers.get("host");
    if (host) {
      const proto = request?.headers.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}${WEBHOOK_PATH}`;
    }
  } catch {
    // getRequest() fora de um handler de servidor — sem contexto de request.
  }
  return WEBHOOK_PATH;
}

type IntegrationDbRow = {
  id: string;
  provider: string;
  product_id: string;
  environment: string;
  external_product_ucode: string | null;
  external_product_id: string | null;
  external_offer_id: string | null;
  active: boolean;
  updated_at: string;
};

function toClientView(row: IntegrationDbRow): BergamoIntegrationClientView {
  return {
    id: row.id,
    provider: "hotmart",
    environment: row.environment,
    external_product_ucode: row.external_product_ucode,
    external_product_id: row.external_product_id,
    external_offer_id: row.external_offer_id,
    active: row.active,
    updated_at: row.updated_at,
    hottok_configured: isHottokConfigured(),
    webhook_url: buildWebhookUrl(),
  };
}

async function fetchBergamoIntegration(): Promise<IntegrationDbRow | null> {
  const { data, error } = await supabaseAdmin
    .from("payment_integrations")
    .select(
      "id, provider, product_id, environment, external_product_ucode, external_product_id, external_offer_id, active, updated_at, products!inner(slug)",
    )
    .eq("provider", "hotmart")
    .eq("products.slug", "bergamo")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Falha ao carregar a integração: ${error.message}`);
  return data as IntegrationDbRow | null;
}

/** Somente super_admin. Nunca retorna o Hottok — só se ele está configurado no ambiente. */
export async function getBergamoHotmartIntegration(
  actorId: string,
): Promise<BergamoIntegrationClientView | null> {
  await assertSuperAdmin(actorId);
  const row = await fetchBergamoIntegration();
  return row ? toClientView(row) : null;
}

export async function listBergamoWebhookEvents(actorId: string): Promise<BergamoWebhookEventRow[]> {
  await assertSuperAdmin(actorId);
  const { data, error } = await supabaseAdmin
    .from("webhook_events")
    .select("id, event_type, purchase_status, transaction_ref, processing_status, created_at")
    .order("created_at", { ascending: false })
    .limit(15);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface UpdateBergamoIntegrationInput {
  actorId: string;
  external_product_ucode: string | null;
  external_product_id: string | null;
  external_offer_id: string | null;
  environment: "test" | "production";
  active: boolean;
}

/**
 * Somente super_admin. `product_id` nunca é aceito como entrada — a
 * integração é sempre a do Bergamo (reforçado também por trigger no
 * banco). Ativar exige ucode, oferta e o secret HOTMART_HOTTOK no
 * ambiente; a decisão é sempre do servidor, nunca do navegador.
 */
export async function updateBergamoHotmartIntegration(
  input: UpdateBergamoIntegrationInput,
): Promise<BergamoIntegrationClientView> {
  await assertSuperAdmin(input.actorId);

  const existing = await fetchBergamoIntegration();
  if (!existing) {
    throw new Error("Integração do Bergamo não encontrada.");
  }

  const nextUcode = input.external_product_ucode?.trim() || null;
  const nextOffer = input.external_offer_id?.trim() || null;
  const nextProductId = input.external_product_id?.trim() || null;

  if (input.active) {
    const missing = !nextUcode || !nextOffer || !isHottokConfigured();
    if (missing) {
      // Mensagem genérica: não revela qual peça falta nem detalhes do ambiente.
      throw new Error(
        "Não é possível ativar: configure o ucode, a oferta e o Hottok do ambiente antes de ativar.",
      );
    }
  }

  const { data, error } = await supabaseAdmin
    .from("payment_integrations")
    .update({
      external_product_ucode: nextUcode,
      external_product_id: nextProductId,
      external_offer_id: nextOffer,
      environment: input.environment,
      active: input.active,
    })
    .eq("id", existing.id)
    .select(
      "id, provider, product_id, environment, external_product_ucode, external_product_id, external_offer_id, active, updated_at",
    )
    .single();

  if (error) throw new Error(error.message);

  const wasActive = existing.active;
  await logAudit({
    actorId: input.actorId,
    action:
      wasActive === data.active
        ? "integration.hotmart.update"
        : data.active
          ? "integration.hotmart.activate"
          : "integration.hotmart.deactivate",
    entity: "payment_integrations",
    entityId: data.id,
    meta: {
      environment: data.environment,
      external_product_ucode: data.external_product_ucode,
      external_offer_id: data.external_offer_id,
      active: data.active,
      hottok_configured: isHottokConfigured(),
    },
  });

  return toClientView(data as IntegrationDbRow);
}
