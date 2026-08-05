import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface MyProductAccessRow {
  productId: string;
  slug: string;
  name: string;
  tagline: string | null;
}

/**
 * Produtos com acesso ativo do usuário autenticado. "Ativo" é decidido
 * inteiramente aqui (revoked_at/suspended_at/expires_at), nunca por uma
 * flag simples — acesso suspenso ou revogado nunca aparece como ativo.
 */
export async function getMyProductAccess(userId: string): Promise<MyProductAccessRow[]> {
  const { data, error } = await supabaseAdmin
    .from("product_access")
    .select("product_id, expires_at, products!inner(id, slug, name, tagline)")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .is("suspended_at", null);

  if (error) throw new Error(error.message);

  const now = Date.now();
  return (data ?? [])
    .filter((row) => !row.expires_at || new Date(row.expires_at).getTime() > now)
    .map((row) => ({
      productId: row.products.id,
      slug: row.products.slug,
      name: row.products.name,
      tagline: row.products.tagline,
    }));
}

export interface BergamoMemberItem {
  code: string;
  title: string;
  category: string;
  description: string | null;
  prompt: string;
}

export interface BergamoMemberUpdate {
  id: string;
  title: string;
  content: string;
  publishedAt: string | null;
}

export interface BergamoMemberContent {
  items: BergamoMemberItem[];
  categories: string[];
  updates: BergamoMemberUpdate[];
}

/**
 * Conteúdo completo do Bergamo para membros. Retorna `null` quando o
 * usuário não tem acesso ativo — nesse caso NENHUM item, prompt ou
 * atualização é incluído na resposta (não é filtrado no cliente, nunca
 * chega a existir na resposta do servidor).
 */
export async function getBergamoMemberContent(
  userId: string,
): Promise<BergamoMemberContent | null> {
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", "bergamo")
    .maybeSingle();
  if (!product) return null;

  const { data: hasAccess, error: accessError } = await supabaseAdmin.rpc("has_product_access", {
    _user_id: userId,
    _product_id: product.id,
  });
  if (accessError) throw new Error(accessError.message);
  if (!hasAccess) return null;

  const [itemsResult, updatesResult] = await Promise.all([
    supabaseAdmin
      .from("product_items")
      .select("code, title, category, description, prompt")
      .eq("product_id", product.id)
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    supabaseAdmin
      .from("product_updates")
      .select("id, title, content, published_at")
      .eq("product_id", product.id)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
  ]);

  if (itemsResult.error) throw new Error(itemsResult.error.message);
  if (updatesResult.error) throw new Error(updatesResult.error.message);

  const items: BergamoMemberItem[] = (itemsResult.data ?? []).map((row) => ({
    code: row.code ?? "",
    title: row.title,
    category: row.category ?? "",
    description: row.description,
    prompt: row.prompt ?? "",
  }));

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );

  const updates: BergamoMemberUpdate[] = (updatesResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    publishedAt: row.published_at,
  }));

  return { items, categories, updates };
}
