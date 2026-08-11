import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { getBergamoAdminCatalog } from "./bergamo-admin-catalog.server";
import { getBergamoPublicCatalog } from "./bergamo-catalog.server";
import { getBergamoOffer } from "./bergamo-offer.server";
import { getBergamoPublicHeroImages } from "./bergamo-private-images.server";
import { getBergamoAuthenticatedExperience } from "./bergamo-viewer.server";

/** Sem middleware de auth — este catálogo é intencionalmente público. */
export const getBergamoPublicCatalogFn = createServerFn({ method: "GET" }).handler(async () => {
  return getBergamoPublicCatalog();
});

/** Sem auth: devolve apenas as seis imagens originalmente expostas no hero, sem prompts pagos. */
export const getBergamoPublicHeroFn = createServerFn({ method: "GET" }).handler(async () => {
  return getBergamoPublicHeroImages(await getBergamoPublicCatalog());
});

export const getBergamoOfferFn = createServerFn({ method: "GET" }).handler(async () => {
  return getBergamoOffer();
});

export const getBergamoAdminCatalogFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.auth.getUser();
    if (error || !data.user || data.user.id !== context.userId) {
      throw new Error("Unauthorized: Invalid session");
    }
    return getBergamoAdminCatalog(context.userId);
  });

export const getBergamoAuthenticatedExperienceFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.auth.getUser();
    if (error || !data.user || data.user.id !== context.userId) {
      throw new Error("Unauthorized: Invalid session");
    }
    return getBergamoAuthenticatedExperience(context.userId);
  });
