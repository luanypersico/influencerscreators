import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { getBergamoMemberContent, getMyProductAccess, getRecommendedOffers } from "./member.server";

export const memberGetMyAccessFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getMyProductAccess(context.userId));

export const memberGetBergamoContentFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getBergamoMemberContent(context.userId));

/** Ofertas recomendadas (vitrine afiliada) — leitura pública das ativas, sem relação com entitlement. */
export const memberGetRecommendedOffersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => getRecommendedOffers());
