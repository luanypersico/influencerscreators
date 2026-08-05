/**
 * Testes puros (sem mocks, sem I/O) do parser de entrada da server
 * function de atualização. Prova diretamente que campos forjados no
 * payload bruto — actorId, product_id, provider, hottok — nunca
 * sobrevivem à validação, não importa o que o cliente envie.
 */
import { describe, expect, it } from "bun:test";

import { parseUpdateBergamoIntegrationInput } from "./admin-integrations.functions";

describe("parseUpdateBergamoIntegrationInput — whitelist contra payload forjado", () => {
  it("mantém apenas os campos legítimos quando o payload é válido", () => {
    const result = parseUpdateBergamoIntegrationInput({
      external_product_ucode: "ucode-1",
      external_product_id: "123",
      external_offer_id: "offer-1",
      environment: "test",
      active: true,
    });
    expect(result).toEqual({
      external_product_ucode: "ucode-1",
      external_product_id: "123",
      external_offer_id: "offer-1",
      environment: "test",
      active: true,
    });
  });

  it("descarta actorId forjado pelo cliente — não sobrevive à validação", () => {
    const result = parseUpdateBergamoIntegrationInput({
      external_product_ucode: "u1",
      external_offer_id: "o1",
      environment: "production",
      active: false,
      actorId: "usuario-arbitrario-escolhido-pelo-atacante",
    });
    expect("actorId" in result).toBe(false);
  });

  it("descarta product_id forjado pelo cliente — não sobrevive à validação", () => {
    const result = parseUpdateBergamoIntegrationInput({
      external_product_ucode: "u1",
      external_offer_id: "o1",
      environment: "production",
      active: false,
      product_id: "produto-influencers-creators",
    });
    expect("product_id" in result).toBe(false);
  });

  it("descarta provider forjado pelo cliente — não sobrevive à validação", () => {
    const result = parseUpdateBergamoIntegrationInput({
      external_product_ucode: "u1",
      external_offer_id: "o1",
      environment: "production",
      active: false,
      provider: "stripe",
    });
    expect("provider" in result).toBe(false);
  });

  it("descarta hottok forjado pelo cliente — não sobrevive à validação", () => {
    const result = parseUpdateBergamoIntegrationInput({
      external_product_ucode: "u1",
      external_offer_id: "o1",
      environment: "production",
      active: false,
      hottok: "valor-que-nao-deveria-existir-aqui",
    });
    expect("hottok" in result).toBe(false);
    expect(JSON.stringify(result)).not.toContain("valor-que-nao-deveria-existir-aqui");
  });

  it("o resultado nunca tem chaves além das cinco campos permitidos, para qualquer payload", () => {
    const allowed = new Set([
      "external_product_ucode",
      "external_product_id",
      "external_offer_id",
      "environment",
      "active",
    ]);
    const hostile = {
      external_product_ucode: "u1",
      external_offer_id: "o1",
      environment: "production",
      active: false,
      actorId: "x",
      product_id: "y",
      provider: "z",
      hottok: "w",
      __proto__: { polluted: true },
      constructor: { evil: true },
    };
    const result = parseUpdateBergamoIntegrationInput(hostile);
    for (const key of Object.keys(result)) {
      expect(allowed.has(key)).toBe(true);
    }
  });

  it("trata payload nulo/indefinido/tipos inesperados sem lançar exceção e sem vazar nada", () => {
    expect(() => parseUpdateBergamoIntegrationInput(null)).not.toThrow();
    expect(() => parseUpdateBergamoIntegrationInput(undefined)).not.toThrow();
    expect(() => parseUpdateBergamoIntegrationInput("string maliciosa")).not.toThrow();
    expect(() => parseUpdateBergamoIntegrationInput(12345)).not.toThrow();
    expect(() => parseUpdateBergamoIntegrationInput(["array", "malicioso"])).not.toThrow();
  });

  it("normaliza environment desconhecido para 'production' (nunca aceita valor arbitrário)", () => {
    const result = parseUpdateBergamoIntegrationInput({
      external_product_ucode: "u1",
      external_offer_id: "o1",
      environment: "qualquer-coisa-nao-suportada",
      active: false,
    });
    expect(result.environment).toBe("production");
  });
});
