import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import {
  getBergamoHotmartIntegration,
  listBergamoWebhookEvents,
  updateBergamoHotmartIntegration,
} from "./admin-integrations.server";

export interface UpdateBergamoIntegrationRequest {
  external_product_ucode: string | null;
  external_product_id: string | null;
  external_offer_id: string | null;
  environment: "test" | "production";
  active: boolean;
}

/**
 * Whitelist explícita do que o cliente pode enviar para atualizar a
 * integração. Recebe o payload bruto (não confiável, pode conter
 * qualquer coisa — vem de JSON.parse de uma requisição de rede) e
 * reconstrói o objeto campo a campo lendo cada valor individualmente.
 * Qualquer chave extra no payload bruto (actorId, product_id, provider,
 * hottok, etc.) é silenciosamente descartada aqui — nunca chega ao
 * handler, que é o único lugar que decide quem é o ator (via sessão) e
 * qual produto é afetado (sempre o Bergamo, nunca por parâmetro).
 */
export function parseUpdateBergamoIntegrationInput(data: unknown): UpdateBergamoIntegrationRequest {
  const raw = (data ?? {}) as Record<string, unknown>;
  return {
    external_product_ucode:
      typeof raw["external_product_ucode"] === "string" ? raw["external_product_ucode"] : null,
    external_product_id:
      typeof raw["external_product_id"] === "string" ? raw["external_product_id"] : null,
    external_offer_id:
      typeof raw["external_offer_id"] === "string" ? raw["external_offer_id"] : null,
    environment: raw["environment"] === "test" ? "test" : "production",
    active: Boolean(raw["active"]),
  };
}

export const adminGetBergamoIntegrationFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return getBergamoHotmartIntegration(context.userId);
  });

export const adminListBergamoWebhookEventsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return listBergamoWebhookEvents(context.userId);
  });

export const adminUpdateBergamoIntegrationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(parseUpdateBergamoIntegrationInput)
  .handler(async ({ context, data }) => {
    return updateBergamoHotmartIntegration({ actorId: context.userId, ...data });
  });
