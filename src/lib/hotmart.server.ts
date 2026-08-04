/**
 * Hotmart purchase webhook (v2) — produto Bergamo apenas.
 *
 * Regras invioláveis:
 * - Hottok validado antes de qualquer gravação.
 * - Payload sem identificador de evento, transação, tipo, produto ou oferta => 400 sem persistir nada.
 * - Evento de outro produto/oferta => 200 ignorado, ZERO dado pessoal persistido ou logado.
 * - Usuário Auth só é criado/procurado em PURCHASE_APPROVED e PURCHASE_COMPLETE.
 * - Toda escrita comercial acontece dentro da RPC atômica process_hotmart_event.
 */
import { timingSafeEqual } from "node:crypto";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GRANTING_EVENTS = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE"]);

const SUPPORTED_EVENTS = new Set([
  "PURCHASE_APPROVED",
  "PURCHASE_COMPLETE",
  "PURCHASE_BILLET_PRINTED",
  "PURCHASE_DELAYED",
  "PURCHASE_EXPIRED",
  "PURCHASE_CANCELED",
  "PURCHASE_PROTEST",
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
]);

export interface HotmartExtract {
  eventId: string;
  eventType: string;
  occurredAt: string | null;
  transaction: string;
  productUcode: string;
  productExternalId: string | null;
  offerCode: string;
  purchaseStatus: string | null;
  buyerEmail: string | null;
  buyerName: string | null;
  amountCents: number | null;
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Extrai apenas os campos necessários. Retorna null se o payload for inválido. */
export function extractHotmartEvent(raw: unknown): HotmartExtract | null {
  const root = record(raw);
  const data = record(root["data"]);
  const product = record(data["product"]);
  const purchase = record(data["purchase"]);
  const offer = record(purchase["offer"]);
  const buyer = record(data["buyer"]);
  const price = record(purchase["price"]);

  const eventId = asString(root["id"]);
  const eventType = asString(root["event"]);
  const transaction = asString(purchase["transaction"]);
  const productUcode = asString(product["ucode"]);
  const offerCode = asString(offer["code"]);

  // Sem qualquer um destes o evento não é rastreável nem idempotente.
  if (!eventId || !eventType || !transaction || !productUcode || !offerCode) return null;

  const creationDate = root["creation_date"];
  let occurredAt: string | null = null;
  if (typeof creationDate === "number" && Number.isFinite(creationDate)) {
    occurredAt = new Date(creationDate).toISOString();
  } else if (typeof creationDate === "string" && creationDate.trim() !== "") {
    const parsed = new Date(creationDate);
    occurredAt = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const priceValue = price["value"];
  const amountCents =
    typeof priceValue === "number" && Number.isFinite(priceValue) ? Math.round(priceValue * 100) : null;

  const buyerEmail = asString(buyer["email"]);

  return {
    eventId,
    eventType,
    occurredAt,
    transaction,
    productUcode,
    productExternalId: asString(product["id"]),
    offerCode,
    purchaseStatus: asString(purchase["status"]),
    buyerEmail: buyerEmail ? normalizeEmail(buyerEmail) : null,
    buyerName: asString(buyer["name"]),
    amountCents,
  };
}

/**
 * Localiza (ou cria, quando permitido) o usuário Auth do comprador.
 * Nunca percorre páginas de listUsers — usa lookup determinístico server-only.
 */
async function resolveBuyerUserId(email: string, fullName: string | null): Promise<string> {
  const existing = await supabaseAdmin.rpc("find_user_id_by_email", { _email: email });
  if (existing.error) throw new Error(`lookup de usuário falhou: ${existing.error.message}`);
  if (existing.data) return existing.data;

  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: fullName ? { full_name: fullName } : {},
  });

  if (created.data?.user?.id) return created.data.user.id;

  // Corrida entre APPROVED e COMPLETE: e-mail já registrado -> reutiliza.
  const retry = await supabaseAdmin.rpc("find_user_id_by_email", { _email: email });
  if (retry.data) return retry.data;

  throw new Error(`não foi possível resolver o usuário do comprador: ${created.error?.message ?? "desconhecido"}`);
}

export async function handleHotmartWebhook(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const secret = process.env["HOTMART_HOTTOK"];
  if (!secret) {
    console.error("[hotmart] HOTMART_HOTTOK não configurado");
    return json(500, { error: "integration_not_configured" });
  }

  const hottok = request.headers.get("x-hotmart-hottok") ?? "";
  if (!hottok || !constantTimeEquals(hottok, secret)) {
    return json(401, { error: "invalid_hottok" });
  }

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const event = extractHotmartEvent(parsed);
  if (!event) {
    return json(400, { error: "invalid_payload" });
  }

  // Integração ativa + produto correspondente (sem tocar dados pessoais ainda).
  const integration = await supabaseAdmin
    .from("payment_integrations")
    .select("id, product_id, environment, products!inner(slug)")
    .eq("provider", "hotmart")
    .eq("active", true)
    .eq("external_product_ucode", event.productUcode)
    .eq("external_offer_id", event.offerCode)
    .maybeSingle();

  if (integration.error) {
    console.error("[hotmart] falha ao resolver integração", {
      event_id: event.eventId,
      message: integration.error.message,
    });
    return json(500, { error: "integration_lookup_failed" });
  }

  const row = integration.data;
  const slug = row?.products?.slug ?? null;

  if (!row || slug !== "bergamo") {
    // Log técnico mínimo — nenhum dado pessoal, nenhuma persistência.
    console.info("[hotmart] evento fora de escopo ignorado", {
      external_event_id: event.eventId,
      event_type: event.eventType,
      product_ucode: event.productUcode,
      offer_code: event.offerCode,
      reason: row ? "produto da integração não é bergamo" : "nenhuma integração ativa correspondente",
    });
    return json(200, { status: "ignored", reason: "out_of_scope" });
  }

  const isGranting = GRANTING_EVENTS.has(event.eventType);
  const isSupported = SUPPORTED_EVENTS.has(event.eventType);

  let userId: string | null = null;
  if (isSupported && isGranting) {
    if (!event.buyerEmail) {
      return json(400, { error: "invalid_payload", detail: "buyer_email_missing" });
    }
    try {
      userId = await resolveBuyerUserId(event.buyerEmail, event.buyerName);
    } catch (error) {
      console.error("[hotmart] identidade do comprador falhou", {
        external_event_id: event.eventId,
        event_type: event.eventType,
      });
      console.error(error);
      return json(500, { error: "identity_resolution_failed" });
    }
  }

  // A RPC aceita NULL nestes parâmetros; os tipos gerados os declaram como obrigatórios.
  const rpcArgs = {
    p_integration_id: row.id,
    p_product_id: row.product_id,
    p_external_event_id: event.eventId,
    p_event_type: event.eventType,
    p_event_occurred_at: event.occurredAt,
    p_transaction_ref: event.transaction,
    p_purchase_status: event.purchaseStatus,
    p_payload: {
      transaction: event.transaction,
      product_ucode: event.productUcode,
      product_id: event.productExternalId,
      offer_code: event.offerCode,
      purchase_status: event.purchaseStatus,
      amount_cents: event.amountCents,
      buyer_email: event.buyerEmail,
      buyer_name: event.buyerName,
    },
    p_user_id: userId,
    p_buyer_email: event.buyerEmail,
    p_buyer_name: event.buyerName,
    p_amount_cents: event.amountCents,
  } as unknown as ProcessHotmartEventArgs;

  const processed = await supabaseAdmin.rpc("process_hotmart_event", rpcArgs);

  if (processed.error) {
    console.error("[hotmart] processamento falhou", {
      external_event_id: event.eventId,
      event_type: event.eventType,
      message: processed.error.message,
    });
    return json(500, { error: "processing_failed" });
  }

  const result = record(processed.data);
  return json(200, { status: asString(result["status"]) ?? "processed" });
}
