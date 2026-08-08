import { supabaseAdmin } from "@/integrations/supabase/client.server";

import type { BergamoPublicCatalog } from "./bergamo-catalog.server";

const BERGAMO_PRIVATE_BUCKET = "bergamo-private-gallery";
const SIGNED_IMAGE_TTL_SECONDS = 15 * 60;

export interface SignedImageResult {
  signedUrl?: string | null;
  error?: string | null;
}

export function mergeBergamoSignedImageUrls(
  catalog: BergamoPublicCatalog,
  signedImages: SignedImageResult[],
): BergamoPublicCatalog {
  if (signedImages.length !== catalog.items.length) {
    throw new Error("Galeria privada incompleta.");
  }

  return {
    ...catalog,
    items: catalog.items.map((item, index) => {
      const signedImage = signedImages[index];
      if (!signedImage?.signedUrl || signedImage.error) {
        throw new Error(`Imagem privada indisponível para o item ${item.code}.`);
      }
      return { ...item, imageUrl: signedImage.signedUrl };
    }),
  };
}

/**
 * Assina os 90 originais somente depois de o chamador ter sido autorizado.
 * Nenhum caminho de bucket, TTL ou permissão vem do navegador.
 */
export async function attachBergamoPrivateImages(
  catalog: BergamoPublicCatalog,
): Promise<BergamoPublicCatalog> {
  const paths = catalog.items.map((item) => `items/${item.code}.jpg`);
  const { data, error } = await supabaseAdmin.storage
    .from(BERGAMO_PRIVATE_BUCKET)
    .createSignedUrls(paths, SIGNED_IMAGE_TTL_SECONDS);

  if (error) throw new Error(`Falha ao assinar galeria privada: ${error.message}`);
  return mergeBergamoSignedImageUrls(catalog, data ?? []);
}
