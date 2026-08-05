import { supabase } from "@/integrations/supabase/client";

/**
 * Catálogo público do Bergamo — servido para a página de vendas (/bergamo).
 * Contrato client-safe: título, categoria, descrição curta e contagem
 * sempre presentes; o texto completo do prompt (`prompt`) só vem
 * preenchido para os itens marcados como amostra gratuita (`isFree`).
 * Para os demais 87 prompts, `prompt` é sempre `null` — o valor real
 * nunca sai do servidor, então nunca entra no bundle do navegador.
 *
 * Deliberadamente NÃO usa supabaseAdmin/service_role: a página pública
 * precisa funcionar mesmo quando SUPABASE_SERVICE_ROLE_KEY não está
 * configurado no ambiente (o que já aconteceu neste projeto e derrubou
 * o catálogo inteiro). Em vez disso, chama a função Postgres
 * `get_bergamo_public_catalog()` (SECURITY DEFINER, sem argumentos,
 * travada no produto Bergamo) usando o mesmo cliente anon/publishable
 * que o navegador já usa — sem privilégio nenhum além do que qualquer
 * visitante anônimo já tem.
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
  const { data, error } = await supabase.rpc("get_bergamo_public_catalog");

  if (error) throw new Error(error.message);

  const items: BergamoCatalogItem[] = (data ?? [])
    // Reforço em código, não só na RPC: a função no banco já filtra só
    // published, mas repetimos aqui como segunda trava independente.
    .filter((row) => row.status === "published")
    .map((row) => ({
      code: row.code ?? "",
      title: row.title,
      category: row.category ?? "",
      description: row.description,
      isFree: row.is_free,
      // Reforço em código, não só na RPC: nunca devolve o texto do
      // prompt para itens que não são a amostra gratuita.
      prompt: row.is_free ? row.prompt : null,
    }));

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );

  return { items, totalCount: items.length, categories };
}
