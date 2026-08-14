/**
 * Verificações estáticas (leitura de arquivos-fonte, sem mocks) do detalhe
 * premium de oferta recomendada: o card nunca vai direto pro checkout (só
 * abre o modal), o checkout só existe dentro do modal e sempre em nova
 * aba, o embed de vídeo nunca usa HTML arbitrário do admin, e nenhuma
 * área protegida (Auth, orders, product_access, /prompts) foi tocada.
 */
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

function readSrc(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

describe("RecommendedOfferCard.tsx — clicar no card abre o detalhe, nunca o checkout direto", () => {
  const source = readSrc("src/components/member/RecommendedOfferCard.tsx");

  it("é um <button>, não um <a href=checkout_url>", () => {
    expect(source).toMatch(/<button[\s\S]*?onClick=\{\(\) => onSelect\(offer\)\}/);
    expect(source).not.toMatch(/href=\{offer\.checkoutUrl/);
  });

  it("não abre nova aba a partir do card (target/rel pertencem só ao modal)", () => {
    expect(source).not.toContain('target="_blank"');
    expect(source).not.toContain("noopener");
  });
});

describe("OfferDetailModal.tsx — vídeo seguro, checkout único, aviso Hotmart obrigatório", () => {
  const source = readSrc("src/components/member/OfferDetailModal.tsx");

  it("usa buildYouTubeEmbedUrl para montar o iframe, nunca HTML arbitrário", () => {
    expect(source).toContain("buildYouTubeEmbedUrl");
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });

  it("iframe só renderiza quando o embed é válido — nunca player vazio/quebrado", () => {
    expect(source).toMatch(/embedUrl \? \(\s*<iframe/);
  });

  it("sem vídeo, cai para capa ou gradiente — nunca quebra o modal", () => {
    expect(source).toMatch(/offer\.coverUrl \? \(/);
    expect(source).toContain("var(--gradient-bergamo)");
  });

  it("o CTA de compra usa checkout_url, abre em nova aba com rel seguro", () => {
    expect(source).toMatch(/href=\{offer\.checkoutUrl\}/);
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noopener noreferrer"');
  });

  it("o CTA só renderiza quando checkoutUrl existe — nunca um botão de compra quebrado", () => {
    expect(source).toMatch(/\{offer\.checkoutUrl && \(/);
  });

  it("o texto obrigatório de entrega via Hotmart aparece, legível, fora do CTA", () => {
    expect(source).toContain(
      "Após a compra, você receberá o acesso ao curso diretamente na área de membros da",
    );
    expect(source).toContain("Hotmart");
    expect(source).not.toMatch(/text-\[?(8|9)px\]?/);
  });

  it("nunca cria order, product_access ou toca entitlement", () => {
    expect(source).not.toMatch(/orders|product_access|has_product_access/i);
  });
});

describe("RecommendedOffersRow.tsx — controla o modal, um card selecionado por vez", () => {
  const source = readSrc("src/components/member/RecommendedOffersRow.tsx");

  it("gerencia o estado da oferta selecionada e renderiza o modal", () => {
    expect(source).toContain("useState<MemberRecommendedOffer | null>(null)");
    expect(source).toContain("<OfferDetailModal");
    expect(source).toContain("onSelect={setSelectedOffer}");
  });
});

describe("member_offers video_url — migration aditiva, isolada", () => {
  const source = readSrc("supabase/migrations/20260814040000_member_offers_video_url.sql");

  it("adiciona video_url como coluna nullable, só em member_offers", () => {
    expect(source).toMatch(/ADD COLUMN IF NOT EXISTS "video_url" text/);
    expect(source).not.toMatch(/ALTER TABLE public\.(?!"member_offers")/);
  });

  it("não cria nenhuma policy nova — a RLS existente de member_offers já cobre a coluna", () => {
    expect(source).not.toMatch(/CREATE POLICY|DROP POLICY/);
  });
});

describe("Áreas protegidas continuam intocadas por esta rodada", () => {
  it("prompts.tsx não referencia nada do detalhe de oferta recomendada", () => {
    const source = readSrc("src/routes/prompts.tsx");
    expect(source).not.toMatch(/OfferDetailModal|RecommendedOffer|youtube/i);
  });

  it("nenhum componente novo desta rodada importa integração Hotmart ou auth-middleware — só o texto de aviso pode citar 'Hotmart'", () => {
    for (const file of [
      "src/components/member/OfferDetailModal.tsx",
      "src/components/member/RecommendedOfferCard.tsx",
      "src/components/member/RecommendedOffersRow.tsx",
      "src/components/admin/OfferDialog.tsx",
    ]) {
      const source = readSrc(file);
      expect(source).not.toMatch(/from ["'].*hotmart|auth-middleware|process_hotmart_event/i);
    }
  });
});
