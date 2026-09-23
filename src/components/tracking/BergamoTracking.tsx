import { useEffect } from "react";

import { BERGAMO_CONTENT, KAWAI_TRACK_SRC, META_PIXEL_ID } from "@/lib/tracking/meta-pixel";

const FBEVENTS_SRC = "https://connect.facebook.net/en_US/fbevents.js";

/**
 * Cria o `fbq` com fila antes do script externo chegar, exatamente como o
 * snippet oficial do Meta faz — eventos disparados durante o carregamento
 * ficam enfileirados e são enviados quando o fbevents.js termina de carregar.
 */
function ensureFbq(): void {
  if (window.fbq) return;

  const fbq = function (...args: unknown[]) {
    const self = fbq as typeof fbq & { callMethod?: (...a: unknown[]) => void };
    if (self.callMethod) {
      self.callMethod(...args);
      return;
    }
    self.queue.push(args);
  } as ((...args: unknown[]) => void) & { queue: unknown[]; loaded: boolean; version: string };

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";

  window.fbq = fbq;
  window._fbq = fbq;
}

function loadScriptOnce(src: string, attribute: string): void {
  if (document.querySelector(`script[${attribute}]`)) return;
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.setAttribute(attribute, "");
  document.head.appendChild(script);
}

/** Todo CTA de compra aponta para o checkout da Hotmart — é o que identifica o clique. */
function isCheckoutLink(element: HTMLAnchorElement): boolean {
  try {
    return new URL(element.href, window.location.href).hostname.endsWith("hotmart.com");
  } catch {
    return false;
  }
}

export interface BergamoTrackingProps {
  /** Valor da oferta em centavos, usado no InitiateCheckout. */
  priceCents: number | null;
  /** Membro já comprou: a página vira área de conteúdo, sem evento comercial. */
  isMember: boolean;
}

/**
 * Rastreamento da página do Arsenal: Meta Pixel (PageView, ViewContent e
 * InitiateCheckout) e o script de UTM da Kawai.
 *
 * Só roda no navegador — em SSR o efeito não executa, então nada é injetado no
 * HTML servido. O clique de compra é capturado no documento inteiro, porque os
 * CTAs de checkout aparecem no topo, no herói, na galeria e nos planos.
 *
 * A conversão de compra (Purchase) NÃO sai daqui: o checkout acontece no
 * domínio da Hotmart, então ela é enviada pelo servidor, no webhook, via API
 * de Conversões (`meta-capi.server.ts`).
 */
export function BergamoTracking({ priceCents, isMember }: BergamoTrackingProps) {
  useEffect(() => {
    ensureFbq();
    loadScriptOnce(FBEVENTS_SRC, "data-meta-pixel");

    window.fbq?.("init", META_PIXEL_ID);
    window.fbq?.("track", "PageView");

    loadScriptOnce(KAWAI_TRACK_SRC, "data-kawai-utm");
  }, []);

  useEffect(() => {
    if (isMember) return;
    window.fbq?.("track", "ViewContent", {
      content_ids: [...BERGAMO_CONTENT.content_ids],
      content_name: BERGAMO_CONTENT.content_name,
      content_type: BERGAMO_CONTENT.content_type,
      currency: BERGAMO_CONTENT.currency,
      value: priceCents !== null ? priceCents / 100 : undefined,
    });
  }, [isMember, priceCents]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor || !isCheckoutLink(anchor)) return;

      window.fbq?.("track", "InitiateCheckout", {
        content_ids: [...BERGAMO_CONTENT.content_ids],
        content_name: BERGAMO_CONTENT.content_name,
        content_type: BERGAMO_CONTENT.content_type,
        currency: BERGAMO_CONTENT.currency,
        value: priceCents !== null ? priceCents / 100 : undefined,
      });
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [priceCents]);

  return null;
}
