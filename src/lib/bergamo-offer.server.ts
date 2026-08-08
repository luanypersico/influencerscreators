import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface BergamoOffer {
  checkoutUrl: string | null;
  priceCents: number;
}

/** Dados publicos minimos da oferta, sempre limitados ao produto Bergamo. */
export async function getBergamoOffer(): Promise<BergamoOffer> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("checkout_url, price_cents")
    .eq("slug", "bergamo")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Produto Bergamo nao encontrado.");

  const rawUrl = data.checkout_url?.trim() || null;
  let checkoutUrl: string | null = null;

  if (rawUrl) {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") throw new Error("Checkout do Bergamo precisa usar HTTPS.");
    checkoutUrl = parsed.toString();
  }

  return { checkoutUrl, priceCents: data.price_cents };
}
