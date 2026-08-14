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

describe("RecommendedOfferCard.tsx (fechado) — só a capa, sem texto sobre a imagem", () => {
  const source = readSrc("src/components/member/RecommendedOfferCard.tsx");

  it("não renderiza título, descrição ou CTA em texto sobre a capa", () => {
    expect(source).not.toContain("offer.title}</h3>");
    expect(source).not.toContain("offer.description");
    expect(source).not.toContain("Conhecer");
    expect(source).not.toContain("Ver oferta");
  });

  it("não usa gradiente escuro para acomodar texto (não há mais texto para acomodar)", () => {
    expect(source).not.toContain("from-black/90");
  });

  it("mantém a proporção 8:5 da capa, consistente com o admin", () => {
    expect(source).toContain("aspect-[8/5]");
  });
});

describe("OfferDetailModal.tsx — vídeo seguro, checkout único, aviso Hotmart obrigatório", () => {
  const source = readSrc("src/components/member/OfferDetailModal.tsx");

  it("usa buildYouTubeEmbedUrl para montar o iframe, nunca HTML arbitrário", () => {
    expect(source).toContain("buildYouTubeEmbedUrl");
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });

  it("iframe só renderiza quando o embed é válido — nunca player vazio/quebrado", () => {
    const start = source.indexOf("embedUrl ? (");
    const nextBranch = source.indexOf(") : offer.coverUrl ? (");
    expect(start).toBeGreaterThan(-1);
    expect(nextBranch).toBeGreaterThan(start);
    expect(source.slice(start, nextBranch)).toContain("<iframe");
  });

  it("vídeo usa formato vertical (9:16, estilo Shorts), centralizado no modal", () => {
    expect(source).toContain("aspect-[9/16]");
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

describe("RecommendedOffersRow.tsx — presentational, delega o modal para quem a usa", () => {
  const source = readSrc("src/components/member/RecommendedOffersRow.tsx");

  it("não gerencia estado próprio nem renderiza o modal — recebe onSelect por prop", () => {
    expect(source).not.toContain("useState");
    expect(source).not.toContain("<OfferDetailModal");
    expect(source).toContain("onSelect: (offer: MemberRecommendedOffer) => void");
    expect(source).toContain("onSelect={onSelect}");
  });
});

describe("RecommendedOfferBanner.tsx — banner de destaque, mesmo modal compartilhado", () => {
  const source = readSrc("src/components/member/RecommendedOfferBanner.tsx");

  it("não renderiza nada sem uma oferta com bannerUrl", () => {
    expect(source).toMatch(/if \(!offer\?\.bannerUrl\) return null;/);
  });

  it("é clicável e delega para onSelect — nunca link direto de checkout", () => {
    expect(source).toMatch(/<button[\s\S]*?onClick=\{\(\) => onSelect\(offer\)\}/);
    expect(source).not.toMatch(/href=\{offer\.checkoutUrl/);
  });

  it("não renderiza texto sobre a imagem — só a imagem, mesmo padrão do card fechado", () => {
    expect(source).not.toContain("offer.title}</h3>");
    expect(source).not.toContain("offer.description");
  });

  it("imagem inteira, sem corte — sem proporção fixa nem object-cover", () => {
    expect(source).not.toMatch(/aspect-\[/);
    expect(source).not.toContain("object-cover");
    expect(source).toMatch(/className="block h-auto w-full/);
  });
});

describe("MemberHome.tsx — estado do modal elevado, compartilhado entre banner e vitrine", () => {
  const source = readSrc("src/components/member/MemberHome.tsx");

  it("possui o único estado de oferta selecionada e o único <OfferDetailModal>", () => {
    expect(source).toContain("useState<MemberRecommendedOffer | null>(null)");
    expect(source).toContain("<OfferDetailModal");
  });

  it("passa onSelect={setSelectedOffer} tanto para o banner quanto para a vitrine", () => {
    const bannerIdx = source.indexOf("<RecommendedOfferBanner");
    const rowIdx = source.indexOf("<RecommendedOffersRow");
    expect(bannerIdx).toBeGreaterThan(-1);
    expect(rowIdx).toBeGreaterThan(bannerIdx);
    expect(source.slice(bannerIdx, bannerIdx + 120)).toContain("onSelect={setSelectedOffer}");
    expect(source.slice(rowIdx, rowIdx + 120)).toContain("onSelect={setSelectedOffer}");
  });

  it("o banner fica entre a seção 'Meus produtos' e a vitrine de recomendados", () => {
    const productsIdx = source.indexOf("Meus produtos");
    const bannerIdx = source.indexOf("<RecommendedOfferBanner");
    const rowIdx = source.indexOf("<RecommendedOffersRow");
    expect(productsIdx).toBeGreaterThan(-1);
    expect(productsIdx).toBeLessThan(bannerIdx);
    expect(bannerIdx).toBeLessThan(rowIdx);
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

describe("member_offers banner_url — migration aditiva, isolada", () => {
  const source = readSrc("supabase/migrations/20260814050000_member_offers_banner_url.sql");

  it("adiciona banner_url como coluna nullable, só em member_offers", () => {
    expect(source).toMatch(/ADD COLUMN IF NOT EXISTS "banner_url" text/);
    expect(source).not.toMatch(/ALTER TABLE public\.(?!"member_offers")/);
  });

  it("não cria nenhuma policy nova — a RLS existente de member_offers já cobre a coluna", () => {
    expect(source).not.toMatch(/CREATE POLICY|DROP POLICY/);
  });
});

describe("Áreas protegidas continuam intocadas por esta rodada", () => {
  it("prompts.tsx reaproveita o mesmo OfferDetailModal de /membros (mesmo formato do card, com vídeo)", () => {
    const source = readSrc("src/routes/prompts.tsx");
    expect(source).toContain(
      'import { OfferDetailModal } from "@/components/member/OfferDetailModal"',
    );
  });

  it("nenhum componente novo desta rodada importa integração Hotmart ou auth-middleware — só o texto de aviso pode citar 'Hotmart'", () => {
    for (const file of [
      "src/components/member/OfferDetailModal.tsx",
      "src/components/member/RecommendedOfferCard.tsx",
      "src/components/member/RecommendedOfferBanner.tsx",
      "src/components/member/RecommendedOffersRow.tsx",
      "src/components/admin/OfferDialog.tsx",
    ]) {
      const source = readSrc(file);
      expect(source).not.toMatch(/from ["'].*hotmart|auth-middleware|process_hotmart_event/i);
    }
  });
});
