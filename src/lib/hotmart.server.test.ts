/**
 * Testes do webhook Hotmart.
 *
 * - `extractHotmartEvent` é testado como função pura (sem I/O real).
 * - `handleHotmartWebhook` é testado com `supabaseAdmin` MOCKADO via
 *   `mock.module` — nenhum destes testes toca o banco real, a RPC real
 *   ou o Auth real. Isso é declarado explicitamente porque o objetivo
 *   é a lógica de borda do handler (tamanho de corpo, Hottok, forma do
 *   payload, escopo do produto), não o comportamento transacional da
 *   RPC `process_hotmart_event` (que vive no Postgres e não tem um
 *   ambiente de teste isolado disponível nesta rodada — ver relatório).
 */
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

type MockIntegrationsResult = { data: unknown[] | null; error: { message: string } | null };
let integrationsResult: MockIntegrationsResult = { data: [], error: null };
let rpcResult: { data: unknown; error: { message: string } | null } = {
  data: { status: "processed" },
  error: null,
};
let findUserResult: { data: string | null; error: { message: string } | null } = {
  data: "buyer-user-id",
  error: null,
};
let inviteCalls: Array<{
  email: string;
  redirectTo?: string;
  fullName?: string;
}> = [];
let inviteResult: {
  data: { user: { id: string } | null };
  error: { message: string } | null;
} = { data: { user: { id: "invited-buyer-id" } }, error: null };

mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: (_table: string) => ({
      select: (_cols: string) => ({
        eq: (_c1: string, _v1: unknown) => ({
          eq: (_c2: string, _v2: unknown) => Promise.resolve(integrationsResult),
        }),
      }),
    }),
    rpc: (fn: string, _args: unknown) =>
      fn === "find_user_id_by_email" ? Promise.resolve(findUserResult) : Promise.resolve(rpcResult),
    auth: {
      admin: {
        inviteUserByEmail: (
          email: string,
          options?: { redirectTo?: string; data?: { full_name?: string } },
        ) => {
          inviteCalls.push({
            email,
            ...(options?.redirectTo ? { redirectTo: options.redirectTo } : {}),
            ...(options?.data?.full_name ? { fullName: options.data.full_name } : {}),
          });
          return Promise.resolve(inviteResult);
        },
      },
    },
  },
}));

const { extractHotmartEvent, handleHotmartWebhook, readBodyWithLimit, MAX_BODY_BYTES } =
  await import("./hotmart.server");

const VALID_PAYLOAD = {
  id: "evt-1",
  event: "PURCHASE_APPROVED",
  creation_date: 1700000000000,
  data: {
    product: { ucode: "ucode-1", id: "999" },
    purchase: {
      transaction: "TXN-1",
      status: "APPROVED",
      offer: { code: "offer-1" },
      price: { value: 27 },
    },
    buyer: { email: "comprador@example.com", name: "Comprador" },
  },
};

function makeRequest(opts: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  bodyStream?: ReadableStream<Uint8Array>;
  contentLength?: string | null;
}): Request {
  const headers = new Headers(opts.headers ?? {});
  if (opts.contentLength !== undefined) {
    if (opts.contentLength === null) headers.delete("content-length");
    else headers.set("content-length", opts.contentLength);
  }
  const init: RequestInit & { duplex?: "half" } = {
    method: opts.method ?? "POST",
    headers,
  };
  if (opts.bodyStream) {
    init.body = opts.bodyStream;
    init.duplex = "half";
  } else if (opts.body !== undefined) {
    init.body = opts.body;
  }
  return new Request("http://localhost/api/public/webhooks/hotmart", init);
}

function streamOfSize(bytes: number): ReadableStream<Uint8Array> {
  const chunkSize = 8192;
  let sent = 0;
  return new ReadableStream({
    pull(controller) {
      if (sent >= bytes) {
        controller.close();
        return;
      }
      const size = Math.min(chunkSize, bytes - sent);
      controller.enqueue(new Uint8Array(size).fill(97));
      sent += size;
    },
  });
}

describe("extractHotmartEvent (unit, puro)", () => {
  it("extrai um payload válido", () => {
    const event = extractHotmartEvent(VALID_PAYLOAD);
    expect(event).not.toBeNull();
    expect(event?.eventId).toBe("evt-1");
    expect(event?.productUcode).toBe("ucode-1");
    expect(event?.offerCode).toBe("offer-1");
    expect(event?.buyerEmail).toBe("comprador@example.com");
    expect(event?.amountCents).toBe(2700);
  });

  it("retorna null quando falta o id do evento", () => {
    const payload = structuredClone(VALID_PAYLOAD) as Record<string, unknown>;
    delete payload["id"];
    expect(extractHotmartEvent(payload)).toBeNull();
  });

  it("retorna null quando falta a transação", () => {
    const payload = structuredClone(VALID_PAYLOAD);
    delete (payload.data.purchase as Partial<typeof payload.data.purchase>).transaction;
    expect(extractHotmartEvent(payload)).toBeNull();
  });

  it("retorna null quando falta o ucode do produto", () => {
    const payload = structuredClone(VALID_PAYLOAD);
    delete (payload.data.product as Partial<typeof payload.data.product>).ucode;
    expect(extractHotmartEvent(payload)).toBeNull();
  });

  it("retorna null para payload que não é objeto", () => {
    expect(extractHotmartEvent("not-an-object")).toBeNull();
    expect(extractHotmartEvent(null)).toBeNull();
  });
});

describe("readBodyWithLimit (unit, puro)", () => {
  it("lê corpo dentro do limite", async () => {
    const result = await readBodyWithLimit(makeRequest({ body: "abc" }), MAX_BODY_BYTES);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.text).toBe("abc");
  });

  it("corta a leitura quando o stream excede o limite, mesmo sem Content-Length", async () => {
    const req = makeRequest({
      bodyStream: streamOfSize(MAX_BODY_BYTES + 1024),
      contentLength: null,
    });
    const result = await readBodyWithLimit(req, MAX_BODY_BYTES);
    expect(result.ok).toBe(false);
  });

  it("aceita corpo exatamente no limite", async () => {
    const req = makeRequest({ bodyStream: streamOfSize(MAX_BODY_BYTES), contentLength: null });
    const result = await readBodyWithLimit(req, MAX_BODY_BYTES);
    expect(result.ok).toBe(true);
  });
});

describe("handleHotmartWebhook (mockado — supabaseAdmin substituído, sem banco real)", () => {
  const ORIGINAL_ENV = process.env["HOTMART_HOTTOK"];

  beforeEach(() => {
    process.env["HOTMART_HOTTOK"] = "segredo-de-teste";
    integrationsResult = { data: [], error: null };
    rpcResult = { data: { status: "processed" }, error: null };
    findUserResult = { data: "buyer-user-id", error: null };
    inviteCalls = [];
    inviteResult = { data: { user: { id: "invited-buyer-id" } }, error: null };
  });

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) delete process.env["HOTMART_HOTTOK"];
    else process.env["HOTMART_HOTTOK"] = ORIGINAL_ENV;
  });

  it("rejeita métodos diferentes de POST com 405", async () => {
    const res = await handleHotmartWebhook(makeRequest({ method: "GET" }));
    expect(res.status).toBe(405);
  });

  it("rejeita Content-Length acima de 256KB com 413, antes de checar o token", async () => {
    const res = await handleHotmartWebhook(
      makeRequest({ body: "x", contentLength: String(MAX_BODY_BYTES + 1) }),
    );
    expect(res.status).toBe(413);
  });

  it("rejeita corpo real acima de 256KB com 413 mesmo sem Content-Length confiável", async () => {
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "segredo-de-teste" },
        bodyStream: streamOfSize(MAX_BODY_BYTES + 4096),
        contentLength: null,
      }),
    );
    expect(res.status).toBe(413);
  });

  it("rejeita quando o header do Hottok está ausente", async () => {
    const res = await handleHotmartWebhook(makeRequest({ body: JSON.stringify(VALID_PAYLOAD) }));
    expect(res.status).toBe(401);
  });

  it("rejeita quando HOTMART_HOTTOK não está configurado no ambiente", async () => {
    delete process.env["HOTMART_HOTTOK"];
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "qualquer-coisa" },
        body: JSON.stringify(VALID_PAYLOAD),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("rejeita quando o Hottok recebido não bate com o do ambiente", async () => {
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "token-errado" },
        body: JSON.stringify(VALID_PAYLOAD),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("responde 400 para JSON inválido, com token correto", async () => {
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "segredo-de-teste" },
        body: "{ isso não é json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("responde 400 para payload incompleto (sem transação)", async () => {
    const payload = structuredClone(VALID_PAYLOAD);
    delete (payload.data.purchase as Partial<typeof payload.data.purchase>).transaction;
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "segredo-de-teste" },
        body: JSON.stringify(payload),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("ignora com 200 quando não há integração ativa correspondente (produto fora de escopo)", async () => {
    integrationsResult = { data: [], error: null };
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "segredo-de-teste" },
        body: JSON.stringify(VALID_PAYLOAD),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ignored");
  });

  it("ignora com 200 quando ucode/oferta não casam com a integração ativa (outro produto)", async () => {
    integrationsResult = {
      data: [
        {
          id: "int-1",
          product_id: "prod-1",
          external_product_ucode: "outro-ucode",
          external_offer_id: "outra-oferta",
          products: { slug: "bergamo" },
        },
      ],
      error: null,
    };
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "segredo-de-teste" },
        body: JSON.stringify(VALID_PAYLOAD),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ignored");
  });

  it("processa quando a integração casa produto/oferta e retorna o status da RPC (mockada)", async () => {
    integrationsResult = {
      data: [
        {
          id: "int-1",
          product_id: "prod-bergamo",
          external_product_ucode: "ucode-1",
          external_offer_id: "offer-1",
          products: { slug: "bergamo" },
        },
      ],
      error: null,
    };
    rpcResult = { data: { status: "processed" }, error: null };
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "segredo-de-teste" },
        body: JSON.stringify(VALID_PAYLOAD),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("processed");
  });

  it("convida comprador novo para criar a própria senha, sem senha temporária", async () => {
    integrationsResult = {
      data: [
        {
          id: "int-1",
          product_id: "prod-bergamo",
          external_product_ucode: "ucode-1",
          external_offer_id: "offer-1",
          products: { slug: "bergamo" },
        },
      ],
      error: null,
    };
    findUserResult = { data: null, error: null };

    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "segredo-de-teste" },
        body: JSON.stringify(VALID_PAYLOAD),
      }),
    );

    expect(res.status).toBe(200);
    expect(inviteCalls).toEqual([
      {
        email: "comprador@example.com",
        fullName: "Comprador",
        redirectTo: "https://influencerscreators.pages.dev/auth/callback?next=/auth/set-password",
      },
    ]);
  });

  it("responde 500 quando a RPC (mockada) retorna erro", async () => {
    integrationsResult = {
      data: [
        {
          id: "int-1",
          product_id: "prod-bergamo",
          external_product_ucode: "ucode-1",
          external_offer_id: "offer-1",
          products: { slug: "bergamo" },
        },
      ],
      error: null,
    };
    rpcResult = { data: null, error: { message: "falha simulada" } };
    const res = await handleHotmartWebhook(
      makeRequest({
        headers: { "x-hotmart-hottok": "segredo-de-teste" },
        body: JSON.stringify(VALID_PAYLOAD),
      }),
    );
    expect(res.status).toBe(500);
  });
});
