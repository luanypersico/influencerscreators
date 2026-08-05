import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

const BERGAMO_IMAGE_BUCKET = "bergamo-member-images";
const BERGAMO_IMAGE_SIGNED_URL_TTL_SECONDS = 90;

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
  /**
   * Nunca o caminho do arquivo nem uma URL — só um booleano dizendo se
   * existe imagem privada mapeada para este item, para a interface
   * decidir se mostra o botão "Ver imagem". A URL de verdade só é
   * gerada sob demanda por getBergamoMemberImageSignedUrl.
   */
  hasPrivateImage: boolean;
}

export interface BergamoMemberUpdate {
  id: string;
  title: string;
  content: string;
  publishedAt: string | null;
}

export interface BergamoMemberWatermark {
  maskedEmail: string;
  shortId: string;
  label: string;
}

export interface BergamoMemberContent {
  items: BergamoMemberItem[];
  categories: string[];
  updates: BergamoMemberUpdate[];
  watermark: BergamoMemberWatermark;
}

/**
 * Mascara o e-mail para a marca-d'água (dissuasão contra print/
 * compartilhamento) — mostra só os 2 primeiros caracteres do usuário
 * local, nunca o domínio inteiro do usuário nem o e-mail completo.
 */
export function maskEmailForWatermark(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "conta protegida";
  const visibleLength = Math.min(2, local.length);
  const visible = local.slice(0, visibleLength);
  const masked = "*".repeat(Math.max(local.length - visibleLength, 3));
  return `${visible}${masked}@${domain}`;
}

/**
 * Identificador curto e não sensível para a marca-d'água — nunca o UUID
 * completo (apenas os 8 primeiros caracteres hexadecimais, sem hifens).
 */
export function shortIdForWatermark(userId: string): string {
  return userId.replace(/-/g, "").slice(0, 8);
}

/**
 * Conteúdo completo do Bergamo para membros. Retorna `null` quando o
 * usuário não tem acesso ativo — nesse caso NENHUM item, prompt ou
 * atualização é incluído na resposta (não é filtrado no cliente, nunca
 * chega a existir na resposta do servidor).
 *
 * A imagem "limpa" não vem aqui: só um booleano (hasPrivateImage) por
 * item. O caminho real do arquivo nunca sai desta função — a URL
 * assinada é gerada sob demanda por getBergamoMemberImageSignedUrl,
 * carregada só quando o comprador abre o card, nunca as 90 de uma vez.
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

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  const [itemsResult, updatesResult] = await Promise.all([
    supabaseAdmin
      .from("product_items")
      .select("code, title, category, description, prompt, member_image_path")
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
    hasPrivateImage: Boolean(row.member_image_path),
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

  const watermark: BergamoMemberWatermark = {
    maskedEmail: maskEmailForWatermark(profile?.email ?? ""),
    shortId: shortIdForWatermark(userId),
    label: "Uso pessoal",
  };

  return { items, categories, updates, watermark };
}

/**
 * URL assinada de curta duração (90s) para a imagem privada de um item
 * do Bergamo — gerada sob demanda, nunca em lote.
 *
 * Duas camadas independentes de autorização, de propósito:
 *  1. Checagem em código com supabaseAdmin (has_product_access) — só
 *     para decidir rápido se vale a pena tentar, com mensagem de erro
 *     genérica.
 *  2. A geração da URL em si roda no cliente AUTENTICADO COMO O PRÓPRIO
 *     USUÁRIO (supabaseAsUser, o mesmo client que o middleware de auth
 *     já monta a partir do JWT da requisição) — isso aciona de verdade
 *     a policy de RLS de storage.objects (a mesma has_product_access),
 *     não só a checagem em JS. Se as duas algum dia divergirem, quem
 *     decide é a RLS: sem sessão de comprador ativo, a Storage API
 *     recusa a signed URL mesmo que o código JS erre.
 *
 * Nunca usa getPublicUrl, nunca usa supabaseAdmin para o passo de
 * assinatura, nunca aceita product_id do cliente (sempre resolvido
 * aqui a partir do slug 'bergamo').
 */
export async function getBergamoMemberImageSignedUrl(
  userId: string,
  supabaseAsUser: SupabaseClient<Database>,
  code: string,
): Promise<string | null> {
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

  const { data: item } = await supabaseAdmin
    .from("product_items")
    .select("member_image_path")
    .eq("product_id", product.id)
    .eq("code", code)
    .eq("status", "published")
    .maybeSingle();
  if (!item?.member_image_path) return null;

  const { data, error } = await supabaseAsUser.storage
    .from(BERGAMO_IMAGE_BUCKET)
    .createSignedUrl(item.member_image_path, BERGAMO_IMAGE_SIGNED_URL_TTL_SECONDS);
  // Erro aqui (inclusive rejeição de RLS) nunca é detalhado ao cliente
  // — só "não disponível", para não confirmar/negar existência do
  // objeto a quem não deveria nem estar perguntando.
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
