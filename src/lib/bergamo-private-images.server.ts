import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { BERGAMO_PUBLIC_HERO_CODES } from "./bergamo-public-hero.constants";
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

/**
 * Libera somente os seis originais usados no hero público de /bergamo.
 * Não recebe código, caminho, produto ou outro parâmetro do navegador. Os
 * demais 84 itens continuam sem URL privada para visitantes anônimos.
 */
export async function getBergamoPublicHeroImages(
  catalog: BergamoPublicCatalog,
): Promise<BergamoPublicCatalog["items"]> {
  const byCode = new Map(catalog.items.map((item) => [item.code, item]));
  const heroItems = BERGAMO_PUBLIC_HERO_CODES.map((code) => byCode.get(code)).filter(
    (item): item is BergamoPublicCatalog["items"][number] => Boolean(item),
  );

  if (heroItems.length !== BERGAMO_PUBLIC_HERO_CODES.length) {
    throw new Error("Vitrine pública do Bergamo incompleta.");
  }

  const { data, error } = await supabaseAdmin.storage.from(BERGAMO_PRIVATE_BUCKET).createSignedUrls(
    BERGAMO_PUBLIC_HERO_CODES.map((code) => `items/${code}.jpg`),
    SIGNED_IMAGE_TTL_SECONDS,
  );

  if (error) throw new Error(`Falha ao carregar imagens da vitrine: ${error.message}`);
  if ((data ?? []).length !== heroItems.length) {
    throw new Error("Imagens da vitrine incompletas.");
  }

  return heroItems.map((item, index) => {
    const signedImage = data?.[index];
    if (!signedImage?.signedUrl || signedImage.error) {
      throw new Error(`Imagem pública indisponível para o item ${item.code}.`);
    }
    // O catálogo público já garante prompt = null para itens pagos.
    return { ...item, imageUrl: signedImage.signedUrl };
  });
}
