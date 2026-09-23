/**
 * API de Conversões do Meta — envio server-side da compra do Bergamo.
 *
 * Por que no servidor: o checkout roda no domínio da Hotmart, então o pixel do
 * navegador nunca vê a compra concluída. A confirmação real chega pelo webhook,
 * e é dela que sai o evento Purchase.
 *
 * Privacidade: nenhum dado pessoal é enviado em claro. E-mail e nome vão
 * apenas como hash SHA-256, que é o formato exigido pelo Meta.
 *
 * O token é secret de ambiente (META_CAPI_ACCESS_TOKEN) e nunca aparece no
 * frontend nem no banco. Sem o token configurado, o envio é apenas ignorado —
 * rastreamento nunca derruba o processamento da venda.
 */
import { META_PIXEL_ID } from "@/lib/tracking/meta-pixel";

const GRAPH_API_VERSION = "v21.0";
const REQUEST_TIMEOUT_MS = 4000;

export interface MetaPurchaseInput {
  /** Referência única da transação na Hotmart — vira o event_id (deduplicação). */
  transaction: string;
  email: string | null;
  fullName: string | null;
  amountCents: number | null;
  currency: string;
  /** Momento real do evento; o Meta rejeita eventos com mais de 7 dias. */
  occurredAt: string | null;
  /** URL da página de vendas que originou a compra. */
  sourceUrl: string;
}

/** Hash exigido pelo Meta: SHA-256 em hexadecimal do valor já normalizado. */
export async function hashForMeta(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Separa o nome em primeiro e último, como o Meta espera (fn / ln). */
export function splitFullName(fullName: string | null): {
  first: string | null;
  last: string | null;
} {
  if (!fullName) return { first: null, last: null };
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: null, last: null };
  if (parts.length === 1) return { first: parts[0] ?? null, last: null };
  return { first: parts[0] ?? null, last: parts[parts.length - 1] ?? null };
}

function eventTimeSeconds(occurredAt: string | null): number {
  const parsed = occurredAt ? new Date(occurredAt) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return Math.floor(parsed.getTime() / 1000);
  }
  return Math.floor(Date.now() / 1000);
}

/** Monta o corpo do evento Purchase, já com os dados pessoais em hash. */
export async function buildPurchasePayload(
  input: MetaPurchaseInput,
): Promise<Record<string, unknown>> {
  const { first, last } = splitFullName(input.fullName);

  const userData: Record<string, string[]> = {};
  if (input.email) userData["em"] = [await hashForMeta(input.email)];
  if (first) userData["fn"] = [await hashForMeta(first)];
  if (last) userData["ln"] = [await hashForMeta(last)];

  return {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTimeSeconds(input.occurredAt),
        // Mesma transação = mesmo event_id: reenvio do webhook não vira venda dobrada.
        event_id: input.transaction,
        event_source_url: input.sourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: input.currency,
          value: input.amountCents !== null ? input.amountCents / 100 : undefined,
          content_ids: ["bergamo"],
          content_name: "Bergamo Creators",
          content_type: "product",
          order_id: input.transaction,
        },
      },
    ],
  };
}

/**
 * Envia o Purchase para o Meta. Nunca lança: qualquer falha é registrada e a
 * venda segue normalmente. Retorna o que aconteceu, para os testes e logs.
 */
export async function sendMetaPurchaseEvent(
  input: MetaPurchaseInput,
): Promise<{ status: "sent" | "skipped" | "failed"; reason?: string }> {
  const accessToken = process.env["META_CAPI_ACCESS_TOKEN"] ?? null;
  if (!accessToken) {
    return { status: "skipped", reason: "missing_token" };
  }

  const payload = await buildPurchasePayload(input);
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Corpo de erro do Meta não traz dados do comprador — só código e mensagem.
      const detail = await response.text().catch(() => "");
      console.error("[meta-capi] envio recusado", {
        status: response.status,
        detail: detail.slice(0, 500),
      });
      return { status: "failed", reason: `http_${response.status}` };
    }

    return { status: "sent" };
  } catch (error) {
    console.error("[meta-capi] falha de rede no envio", {
      message: error instanceof Error ? error.message : "erro desconhecido",
    });
    return { status: "failed", reason: "network_error" };
  }
}
