/**
 * Testes da API de Conversões do Meta.
 *
 * Nenhum teste faz chamada real ao Meta: `fetch` é substituído quando o envio
 * precisa ser observado. O que importa aqui é o contrato do evento — dado
 * pessoal sempre em hash, deduplicação por transação e falha silenciosa.
 */
import { describe, expect, it, afterEach } from "bun:test";

import {
  buildPurchasePayload,
  hashForMeta,
  sendMetaPurchaseEvent,
  splitFullName,
} from "./meta-capi.server";

const BASE_INPUT = {
  transaction: "HP17654321",
  email: "Comprador@Exemplo.com ",
  fullName: "Maria Souza Lima",
  amountCents: 2700,
  currency: "BRL",
  occurredAt: "2026-09-23T12:00:00.000Z",
  sourceUrl: "https://arsenal.obergamo.com.br/prompts",
};

const originalFetch = globalThis.fetch;
const originalToken = process.env["META_CAPI_ACCESS_TOKEN"];

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalToken === undefined) delete process.env["META_CAPI_ACCESS_TOKEN"];
  else process.env["META_CAPI_ACCESS_TOKEN"] = originalToken;
});

describe("hashForMeta", () => {
  it("normaliza antes de gerar o hash (caixa e espaços não mudam o resultado)", async () => {
    expect(await hashForMeta(" Comprador@Exemplo.com ")).toBe(
      await hashForMeta("comprador@exemplo.com"),
    );
  });

  it("gera o SHA-256 em hexadecimal que o Meta espera", async () => {
    expect(await hashForMeta("comprador@exemplo.com")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("splitFullName", () => {
  it("separa primeiro e último nome", () => {
    expect(splitFullName("Maria Souza Lima")).toEqual({ first: "Maria", last: "Lima" });
  });

  it("aceita nome único e ausência de nome", () => {
    expect(splitFullName("Maria")).toEqual({ first: "Maria", last: null });
    expect(splitFullName(null)).toEqual({ first: null, last: null });
  });
});

describe("buildPurchasePayload", () => {
  it("nunca envia e-mail ou nome em claro", async () => {
    const payload = await buildPurchasePayload(BASE_INPUT);
    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain("comprador@exemplo.com");
    expect(serialized).not.toContain("Comprador@Exemplo.com");
    expect(serialized).not.toContain("Maria");
    expect(serialized).not.toContain("Lima");
  });

  it("usa a transação como event_id, para reenvio não virar venda dobrada", async () => {
    const payload = (await buildPurchasePayload(BASE_INPUT)) as {
      data: { event_id: string; custom_data: { value: number; currency: string } }[];
    };

    expect(payload.data[0]?.event_id).toBe("HP17654321");
    expect(payload.data[0]?.custom_data.value).toBe(27);
    expect(payload.data[0]?.custom_data.currency).toBe("BRL");
  });

  it("envia o horário real do evento, não o horário do processamento", async () => {
    const payload = (await buildPurchasePayload(BASE_INPUT)) as { data: { event_time: number }[] };
    expect(payload.data[0]?.event_time).toBe(Math.floor(Date.parse(BASE_INPUT.occurredAt) / 1000));
  });
});

describe("sendMetaPurchaseEvent", () => {
  it("sem token configurado, ignora o envio em vez de falhar", async () => {
    delete process.env["META_CAPI_ACCESS_TOKEN"];
    let called = false;
    globalThis.fetch = (() => {
      called = true;
      return Promise.resolve(new Response("{}", { status: 200 }));
    }) as typeof fetch;

    expect(await sendMetaPurchaseEvent(BASE_INPUT)).toEqual({
      status: "skipped",
      reason: "missing_token",
    });
    expect(called).toBe(false);
  });

  it("erro do Meta não lança — a venda nunca depende do rastreamento", async () => {
    process.env["META_CAPI_ACCESS_TOKEN"] = "token-de-teste";
    globalThis.fetch = (() =>
      Promise.resolve(new Response('{"error":{}}', { status: 400 }))) as typeof fetch;

    expect(await sendMetaPurchaseEvent(BASE_INPUT)).toEqual({
      status: "failed",
      reason: "http_400",
    });
  });

  it("falha de rede também é contida", async () => {
    process.env["META_CAPI_ACCESS_TOKEN"] = "token-de-teste";
    globalThis.fetch = (() => Promise.reject(new Error("timeout"))) as unknown as typeof fetch;

    expect(await sendMetaPurchaseEvent(BASE_INPUT)).toEqual({
      status: "failed",
      reason: "network_error",
    });
  });

  it("token vai no cabeçalho, nunca no corpo do evento", async () => {
    process.env["META_CAPI_ACCESS_TOKEN"] = "token-de-teste";
    let seen: { url: string; init: RequestInit } | null = null;
    globalThis.fetch = ((url: string, init: RequestInit) => {
      seen = { url, init };
      return Promise.resolve(new Response("{}", { status: 200 }));
    }) as unknown as typeof fetch;

    expect(await sendMetaPurchaseEvent(BASE_INPUT)).toEqual({ status: "sent" });
    const call = seen as unknown as { url: string; init: RequestInit };
    expect(call.url).toContain("/events");
    expect(String(call.init.body)).not.toContain("token-de-teste");
    expect((call.init.headers as Record<string, string>)["authorization"]).toBe(
      "Bearer token-de-teste",
    );
  });
});
