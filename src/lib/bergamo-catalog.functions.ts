import { createServerFn } from "@tanstack/react-start";

import { getBergamoPublicCatalog } from "./bergamo-catalog.server";

/** Sem middleware de auth — este catálogo é intencionalmente público. */
export const getBergamoPublicCatalogFn = createServerFn({ method: "GET" }).handler(async () => {
  return getBergamoPublicCatalog();
});
