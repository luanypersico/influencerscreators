import { describe, expect, it } from "bun:test";

import { buildYouTubeEmbedUrl, extractYouTubeVideoId } from "./youtube";

describe("extractYouTubeVideoId — só extrai, nunca interpreta HTML/embed arbitrário", () => {
  it("aceita watch?v=", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=tYd6jyhx5BI")).toBe(
      "tYd6jyhx5BI",
    );
  });

  it("aceita watch?v= com parâmetros extras", () => {
    expect(
      extractYouTubeVideoId("https://www.youtube.com/watch?v=tYd6jyhx5BI&t=42s&si=abc"),
    ).toBe("tYd6jyhx5BI");
  });

  it("aceita youtu.be", () => {
    expect(extractYouTubeVideoId("https://youtu.be/tYd6jyhx5BI")).toBe("tYd6jyhx5BI");
  });

  it("aceita /embed/ já pronto", () => {
    expect(extractYouTubeVideoId("https://www.youtube-nocookie.com/embed/tYd6jyhx5BI")).toBe(
      "tYd6jyhx5BI",
    );
  });

  it("aceita /shorts/", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/shorts/tYd6jyhx5BI")).toBe(
      "tYd6jyhx5BI",
    );
  });

  it("rejeita host que não é YouTube", () => {
    expect(extractYouTubeVideoId("https://vimeo.com/tYd6jyhx5BI")).toBeNull();
    expect(extractYouTubeVideoId("https://evil.com/?v=tYd6jyhx5BI")).toBeNull();
  });

  it("rejeita string que não é URL", () => {
    expect(extractYouTubeVideoId("<script>alert(1)</script>")).toBeNull();
    expect(extractYouTubeVideoId("não é url nenhuma")).toBeNull();
  });

  it("rejeita vazio", () => {
    expect(extractYouTubeVideoId("")).toBeNull();
  });

  it("rejeita ID com formato inválido (não 11 caracteres alfanuméricos)", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=abc")).toBeNull();
    expect(
      extractYouTubeVideoId("https://www.youtube.com/watch?v=<script>alert(1)</script>"),
    ).toBeNull();
  });
});

describe("buildYouTubeEmbedUrl — só monta URL a partir do ID validado", () => {
  it("gera embed youtube-nocookie para URL válida", () => {
    expect(buildYouTubeEmbedUrl("https://www.youtube.com/watch?v=tYd6jyhx5BI")).toBe(
      "https://www.youtube-nocookie.com/embed/tYd6jyhx5BI?rel=0&modestbranding=1",
    );
  });

  it("retorna null para URL inválida — nunca renderiza player quebrado", () => {
    expect(buildYouTubeEmbedUrl("https://exemplo.com/video")).toBeNull();
    expect(buildYouTubeEmbedUrl("")).toBeNull();
  });

  it("nunca inclui autoplay no embed gerado", () => {
    const embed = buildYouTubeEmbedUrl("https://www.youtube.com/watch?v=tYd6jyhx5BI");
    expect(embed).not.toContain("autoplay");
  });
});
