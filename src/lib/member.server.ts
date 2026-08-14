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

export interface MemberRecommendedOffer {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  checkoutUrl: string | null;
  badge: string | null;
  videoUrl: string | null;
}

/**
 * Vitrine de ofertas recomendadas (afiliadas) — nunca concede acesso.
 * `member_offers` é isolada do domínio comercial interno: nunca aparece em
 * orders/product_access/entitlement. Só mostra ofertas ativas E com um
 * checkout_url válido — uma oferta sem link de compra não vira um botão
 * quebrado, some da lista até ser configurada corretamente.
 */
export async function getRecommendedOffers(): Promise<MemberRecommendedOffer[]> {
  const { data, error } = await supabaseAdmin
    .from("member_offers")
    .select("id, title, description, cover_url, checkout_url, badge, video_url")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((row) => Boolean(row.checkout_url?.trim()))
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      coverUrl: row.cover_url,
      checkoutUrl: row.checkout_url,
      badge: row.badge,
      videoUrl: row.video_url,
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
 * Nota de escopo (ainda sem imagem "limpa" aqui): a imagem exigiria um
 * arquivo servido só para quem tem acesso — testamos importar uma
 * versão limpa via um módulo *.server.ts (import.meta.glob + `?url`) e
 * descobrimos que o build do Vite para o bundle do servidor NÃO copia
 * fisicamente o arquivo para .output/public quando o único caminho até
 * ele passa por código server-only (só o build do cliente faz essa
 * cópia) — o link gerado ficaria quebrado em produção. A alternativa
 * seria embutir os 90 arquivos como base64 no bundle do servidor (risco
 * real de estourar limite de tamanho de script no Cloudflare Workers)
 * ou usar um bucket privado do Supabase Storage com URL assinada por
 * requisição — que não pôde ser provisionado nesta rodada por falta de
 * SUPABASE_SERVICE_ROLE_KEY neste ambiente. Registrado para a próxima
 * rodada; o prompt completo continua sendo entregue normalmente.
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

  const watermark: BergamoMemberWatermark = {
    maskedEmail: maskEmailForWatermark(profile?.email ?? ""),
    shortId: shortIdForWatermark(userId),
    label: "Uso pessoal",
  };

  return { items, categories, updates, watermark };
}
