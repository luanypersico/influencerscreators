import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import {
  getBergamoHotmartIntegration,
  listBergamoWebhookEvents,
  updateBergamoHotmartIntegration,
} from "./admin-integrations.server";

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
  .inputValidator(
    (data: {
      external_product_ucode: string | null;
      external_product_id: string | null;
      external_offer_id: string | null;
      environment: "test" | "production";
      active: boolean;
    }) => ({
      external_product_ucode: data?.external_product_ucode ?? null,
      external_product_id: data?.external_product_id ?? null,
      external_offer_id: data?.external_offer_id ?? null,
      environment: (data?.environment === "test" ? "test" : "production") as "test" | "production",
      active: Boolean(data?.active),
    }),
  )
  .handler(async ({ context, data }) => {
    return updateBergamoHotmartIntegration({ actorId: context.userId, ...data });
  });
