import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { assertAdmin } from "./admin.server";
import type { BergamoCatalogItem, BergamoPublicCatalog } from "./bergamo-catalog.server";

/**
 * Catalogo completo do Bergamo exclusivamente para administradores autenticados.
 * O produto e fixado no servidor; nenhum slug ou product_id vem do navegador.
 */
export async function getBergamoAdminCatalog(userId: string): Promise<BergamoPublicCatalog> {
  await assertAdmin(userId);

  const { data, error } = await supabaseAdmin
    .from("product_items")
    .select(
      "code, title, category, description, prompt, is_free, status, sort_order, products!inner(slug)",
    )
    .eq("products.slug", "bergamo")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const items: BergamoCatalogItem[] = (data ?? []).map((row) => ({
    code: row.code ?? "",
    title: row.title,
    category: row.category ?? "",
    description: row.description,
    isFree: row.is_free,
    prompt: row.prompt,
  }));

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );

  return { items, totalCount: items.length, categories };
}
