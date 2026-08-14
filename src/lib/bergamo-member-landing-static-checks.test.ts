/**
 * Verificações estáticas (leitura de arquivos-fonte, sem mocks) de que a
 * home/`/prompts` do Arsenal esconde as seções comerciais (hero, preço,
 * FAQ de pré-compra, item "Planos" do header) só para quem tem acesso
 * real ao produto (`hasFullAccess`, decidido no servidor via
 * has_product_access) — nunca pela simples presença de sessão — e
 * substitui a região comercial por um banner de recomendação que
 * reaproveita a mesma member_offer (bannerUrl) já usada em /membros.
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

describe("prompts.tsx — seções comerciais somem só com acesso real, não com sessão", () => {
  const source = readSrc("src/routes/prompts.tsx");

  it("deriva isMember de viewer.hasFullAccess, nunca só da sessão", () => {
    expect(source).toMatch(/isMember\s*=\s*Boolean\(authenticatedExperience\?\.viewer\?\.hasFullAccess\)/);
  });

  it("esconde o BergamoHero (primeira seção) atrás de !isMember", () => {
    expect(source).toMatch(/\{!isMember\s*&&\s*\(\s*<BergamoHero/);
  });

  it("esconde o BergamoPricing (planos/preço) atrás de !isMember", () => {
    expect(source).toMatch(/\{!isMember\s*&&\s*<BergamoPricing/);
  });

  it("mostra o BergamoRecommendedBanner só para isMember, com as ofertas reais buscadas", () => {
    expect(source).toMatch(/\{isMember\s*&&\s*<BergamoRecommendedBanner offers=\{recommendedOffers/);
  });

  it("busca as ofertas recomendadas reutilizando memberGetRecommendedOffersFn, só quando é membro", () => {
    expect(source).toContain("memberGetRecommendedOffersFn");
    expect(source).toMatch(/queryFn:\s*\(\)\s*=>\s*getRecommendedOffers\(\)[\s\S]{0,40}enabled:\s*isMember/);
  });

  it("passa hideQuestions={isMember} para o BergamoFaq — o rodapé nunca some", () => {
    expect(source).toMatch(/<BergamoFaq hideQuestions=\{isMember\}\s*\/>/);
  });

  it("mantém acervo e bônus sempre renderizados (não gated por isMember)", () => {
    expect(source).not.toMatch(/isMember\s*&&[\s\S]{0,20}<BergamoGallery/);
    expect(source).not.toMatch(/isMember\s*&&[\s\S]{0,20}<BergamoBonus/);
    expect(source).toContain("<BergamoGallery");
    expect(source).toContain("<BergamoBonus");
  });

});

describe("BergamoFaq.tsx — FAQ comercial oculta para aluno, rodapé sempre presente", () => {
  const source = readSrc("src/components/bergamo/BergamoFaq.tsx");

  it("aceita hideQuestions e só esconde o bloco de perguntas, nunca o rodapé", () => {
    expect(source).toMatch(/hideQuestions\??:\s*boolean/);
    const questionsBlock = source.slice(
      source.indexOf("{!hideQuestions"),
      source.indexOf("<footer"),
    );
    expect(questionsBlock).toContain("Perguntas frequentes");
    expect(source).not.toMatch(/hideQuestions[\s\S]{0,60}<footer/);
  });

  it("o rodapé (marca, copyright) é renderizado incondicionalmente", () => {
    const footerIdx = source.indexOf("<footer");
    expect(footerIdx).toBeGreaterThan(-1);
    expect(source.slice(footerIdx)).not.toMatch(/^\s*\{/);
  });
});

describe("BergamoRecommendedBanner.tsx — reaproveita member_offers, sem duplicar dados", () => {
  const source = readSrc("src/components/bergamo/BergamoRecommendedBanner.tsx");

  it("reaproveita MemberRecommendedOffer/bannerUrl — mesma fonte administrável pelo Super Admin", () => {
    expect(source).toContain('import type { MemberRecommendedOffer } from "@/lib/member.server"');
    expect(source).toMatch(/o\.bannerUrl && o\.checkoutUrl/);
  });

  it("não renderiza nada sem uma oferta com banner e checkout configurados", () => {
    expect(source).toMatch(/if \(!offer\?\.bannerUrl \|\| !offer\.checkoutUrl\) return null;/);
  });

  it("clique abre checkout_url direto em nova aba (sem checkout hardcoded)", () => {
    expect(source).toMatch(/href=\{offer\.checkoutUrl\}/);
    expect(source).toContain('target="_blank"');
    expect(source).toContain('rel="noopener noreferrer"');
    expect(source).not.toMatch(/https:\/\/go\.hotmart\.com/);
  });

  it("imagem é o elemento principal, sem texto cobrindo a arte (só o kicker discreto)", () => {
    expect(source).toContain("Recomendado para você");
    expect(source).not.toMatch(/offer\.title\}<\/h[1-6]>/);
    expect(source).not.toContain("offer.description");
  });

  it("nunca cria order, product_access ou toca entitlement/Hotmart", () => {
    expect(source).not.toMatch(/orders|product_access|has_product_access|hotmart/i);
  });
});

describe("BergamoHeader.tsx — CTA comercial vs. menu de conta pelo mesmo critério de acesso real", () => {
  const source = readSrc("src/components/bergamo/BergamoHeader.tsx");

  it("o menu de conta só aparece com viewer.hasFullAccess (não com viewer truthy)", () => {
    expect(source).toMatch(/\{viewer\?\.hasFullAccess\s*\?/);
    expect(source).not.toMatch(/\{viewer\s*\?\s*\(/);
  });

  it("mostra 'Já sou aluno' apontando para /auth quando não é membro", () => {
    expect(source).toContain("Já sou aluno");
    expect(source).toMatch(/href="\/auth"/);
  });

  it("preserva o CTA 'Quero o acervo' para quem não é membro", () => {
    expect(source).toContain("Quero o acervo");
  });

  it("esconde o item de navegação 'Planos' só para viewer.hasFullAccess", () => {
    expect(source).toMatch(/\{!viewer\?\.hasFullAccess\s*&&\s*\(\s*<a\s+href="#planos"/);
  });
});
