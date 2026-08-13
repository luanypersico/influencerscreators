import { describe, expect, it } from "bun:test";

import { sanitizeClientErrorReport } from "./client-diagnostics.server";

describe("sanitizeClientErrorReport", () => {
  it("aceita um payload válido e preserva os campos esperados", () => {
    const report = sanitizeClientErrorReport({
      pathname: "/prompts",
      hostname: "arsenal.obergamo.com.br",
      source: "error_boundary",
      errorName: "TypeError",
      errorMessage: "Cannot read properties of undefined (reading 'map')",
      errorStack: "TypeError: ...\n  at Home (index.js:10:5)",
      correlationId: "abc123",
      clientTimestamp: "2026-08-13T20:03:00.000Z",
    });

    expect(report).not.toBeNull();
    expect(report?.pathname).toBe("/prompts");
    expect(report?.source).toBe("error_boundary");
    expect(report?.errorMessage).toContain("Cannot read properties");
  });

  it("rejeita payload sem errorMessage", () => {
    expect(sanitizeClientErrorReport({ pathname: "/", source: "error_boundary" })).toBeNull();
  });

  it("rejeita corpo que não é objeto", () => {
    expect(sanitizeClientErrorReport("not an object")).toBeNull();
    expect(sanitizeClientErrorReport(null)).toBeNull();
    expect(sanitizeClientErrorReport(42)).toBeNull();
  });

  it("normaliza source desconhecido para 'unknown' em vez de rejeitar", () => {
    const report = sanitizeClientErrorReport({
      errorMessage: "boom",
      source: "totally-made-up-source",
    });
    expect(report?.source).toBe("unknown");
  });

  it("trunca strings muito longas em vez de rejeitar o relatório inteiro", () => {
    const report = sanitizeClientErrorReport({
      errorMessage: "x".repeat(10_000),
      errorStack: "y".repeat(10_000),
    });
    expect(report?.errorMessage.length).toBeLessThanOrEqual(2_000);
    expect(report?.errorStack?.length).toBeLessThanOrEqual(4_000);
  });

  it("nunca deixa campos não previstos (ex.: cookie, token) vazarem para o relatório", () => {
    const report = sanitizeClientErrorReport({
      errorMessage: "boom",
      cookie: "session=super-secret",
      token: "sb-access-token-xyz",
      authorization: "Bearer secret",
    });
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("sb-access-token-xyz");
    expect(serialized).not.toContain("Bearer secret");
  });
});
