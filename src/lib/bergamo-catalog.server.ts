import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Catálogo público do Bergamo — servido para a página de vendas (/bergamo).
 * Contrato client-safe: título, categoria, descrição curta e contagem
 * sempre presentes; o texto completo do prompt (`prompt`) só vem
 * preenchido para os itens marcados como amostra gratuita (`isFree`).
 * Para os demais 87 prompts, `prompt` é sempre `null` — o valor real
 * nunca sai do servidor, então nunca entra no bundle do navegador.
 */
export interface BergamoCatalogItem {
  code: string;
  title: string;
  category: string;
  description: string | null;
  isFree: boolean;
  prompt: string | null;
}

export interface BergamoPublicCatalog {
  items: BergamoCatalogItem[];
  totalCount: number;
  categories: string[];
}

export async function getBergamoPublicCatalog(): Promise<BergamoPublicCatalog> {
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", "bergamo")
    .maybeSingle();

  if (!product) return { items: [], totalCount: 0, categories: [] };

  const { data, error } = await supabaseAdmin
    .from("product_items")
    .select("code, title, category, description, is_free, prompt")
    .eq("product_id", product.id)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const items: BergamoCatalogItem[] = (data ?? []).map((row) => ({
    code: row.code ?? "",
    title: row.title,
    category: row.category ?? "",
    description: row.description,
    isFree: row.is_free,
    // Reforço em código, não só na query: nunca devolve o texto do
    // prompt para itens que não são a amostra gratuita.
    prompt: row.is_free ? row.prompt : null,
  }));

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );

  return { items, totalCount: items.length, categories };
}
