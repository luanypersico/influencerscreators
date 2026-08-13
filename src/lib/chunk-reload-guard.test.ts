import { describe, expect, it } from "bun:test";

import {
  extractErrorMessage,
  isChunkLoadErrorMessage,
  shouldReloadForChunkError,
} from "./chunk-reload-guard";

describe("isChunkLoadErrorMessage", () => {
  it("reconhece as mensagens reais de chunk desatualizado pós-deploy", () => {
    expect(isChunkLoadErrorMessage("Failed to fetch dynamically imported module: /assets/x.js")).toBe(
      true,
    );
    expect(
      isChunkLoadErrorMessage("Importing a module script failed: /assets/y-old.js"),
    ).toBe(true);
    expect(
      isChunkLoadErrorMessage("error loading dynamically imported module: /assets/z.js"),
    ).toBe(true);
    expect(isChunkLoadErrorMessage("Unable to preload CSS for /assets/w.css")).toBe(true);
  });

  it("nunca casa com erros genéricos de aplicação — não esconde bugs reais", () => {
    expect(isChunkLoadErrorMessage("Cannot read properties of undefined (reading 'map')")).toBe(
      false,
    );
    expect(isChunkLoadErrorMessage("TypeError: x is not a function")).toBe(false);
    expect(isChunkLoadErrorMessage("Network request failed")).toBe(false);
    expect(isChunkLoadErrorMessage("")).toBe(false);
  });
});

describe("extractErrorMessage", () => {
  it("extrai a mensagem de um Error, string ou valor desconhecido", () => {
    expect(extractErrorMessage(new Error("boom"))).toBe("boom");
    expect(extractErrorMessage("plain string reason")).toBe("plain string reason");
    expect(extractErrorMessage({ weird: "object" })).toBe("");
    expect(extractErrorMessage(undefined)).toBe("");
  });
});

describe("shouldReloadForChunkError — proteção contra loop de reload", () => {
  it("recarrega na primeira falha desta navegação", () => {
    expect(shouldReloadForChunkError(false)).toBe(true);
  });

  it("não recarrega de novo se já tentou nesta sessão — evita loop infinito", () => {
    expect(shouldReloadForChunkError(true)).toBe(false);
  });
});
