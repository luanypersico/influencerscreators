/**
 * Testes puros (sem DOM, sem React) da geração do padrão da marca-d'água.
 */
import { describe, expect, it } from "bun:test";

import { buildWatermarkPatternDataUri } from "./SessionWatermark";

describe("buildWatermarkPatternDataUri", () => {
  const watermark = { maskedEmail: "lu***@example.com", shortId: "3f9a21bd", label: "Uso pessoal" };

  it("gera uma data URI de SVG", () => {
    const uri = buildWatermarkPatternDataUri(watermark);
    expect(uri.startsWith("data:image/svg+xml;utf8,")).toBe(true);
  });

  it("inclui o e-mail mascarado, o id curto e o rótulo no SVG", () => {
    const uri = buildWatermarkPatternDataUri(watermark);
    const decoded = decodeURIComponent(uri.replace("data:image/svg+xml;utf8,", ""));
    expect(decoded).toContain("lu***@example.com");
    expect(decoded).toContain("3f9a21bd");
    expect(decoded).toContain("Uso pessoal");
  });

  it("escapa caracteres especiais de XML no texto (nunca quebra o SVG)", () => {
    const hostile = { maskedEmail: "a&b<c>@example.com", shortId: "abc123", label: "Uso pessoal" };
    const uri = buildWatermarkPatternDataUri(hostile);
    const decoded = decodeURIComponent(uri.replace("data:image/svg+xml;utf8,", ""));
    expect(decoded).not.toContain("<c>");
    expect(decoded).toContain("&lt;c&gt;");
  });
});
