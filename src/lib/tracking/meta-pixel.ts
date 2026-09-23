/**
 * Meta Pixel (navegador) da página de vendas do Bergamo.
 *
 * O ID do pixel é público por natureza — ele aparece no HTML de qualquer
 * página que carrega o pixel. O token da API de Conversões NÃO mora aqui:
 * ele é secret de ambiente e só é usado no servidor (`meta-capi.server.ts`).
 */
export const META_PIXEL_ID = "35816392767976206";

/** Rastreador de UTM da Kawai, usado pelo coprodutor para atribuição de tráfego. */
export const KAWAI_TRACK_SRC = "https://app.kawaitrack.com/kawai-utm.js";

type FbqFn = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

/** Conteúdo do Bergamo como o Meta espera receber em ViewContent/InitiateCheckout. */
export const BERGAMO_CONTENT = {
  content_ids: ["bergamo"],
  content_name: "Bergamo Creators",
  content_type: "product",
  currency: "BRL",
} as const;

/** Dispara um evento padrão do pixel. Silencioso quando o pixel não carregou. */
export function trackPixelEvent(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}
