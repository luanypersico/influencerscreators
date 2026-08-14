/**
 * Verificações estáticas (leitura de arquivos-fonte, sem mocks) de que a
 * home/`/prompts` do Arsenal esconde a primeira seção comercial (hero) só
 * para quem tem acesso real ao produto (`hasFullAccess`, decidido no
 * servidor via has_product_access) — nunca pela simples presença de sessão —
 * e que o header troca "Já sou aluno" + CTA comercial pelo menu de conta
 * pelo mesmo critério.
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

describe("prompts.tsx — hero comercial some só com acesso real, não com sessão", () => {
  const source = readSrc("src/routes/prompts.tsx");

  it("deriva isMember de viewer.hasFullAccess, nunca só da sessão", () => {
    expect(source).toMatch(/isMember\s*=\s*Boolean\(authenticatedExperience\?\.viewer\?\.hasFullAccess\)/);
  });

  it("esconde somente o BergamoHero (primeira seção) atrás de !isMember", () => {
    expect(source).toMatch(/\{!isMember\s*&&\s*\(\s*<BergamoHero/);
  });

  it("mantém acervo, bônus, planos e FAQ sempre renderizados (não gated por isMember)", () => {
    expect(source).not.toMatch(/isMember\s*&&[\s\S]{0,20}<BergamoGallery/);
    expect(source).not.toMatch(/isMember\s*&&[\s\S]{0,20}<BergamoBonus/);
    expect(source).not.toMatch(/isMember\s*&&[\s\S]{0,20}<BergamoPricing/);
    expect(source).not.toMatch(/isMember\s*&&[\s\S]{0,20}<BergamoFaq/);
    expect(source).toContain("<BergamoGallery");
    expect(source).toContain("<BergamoBonus");
    expect(source).toContain("<BergamoPricing");
    expect(source).toContain("<BergamoFaq");
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
});
