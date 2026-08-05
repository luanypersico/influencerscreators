/**
 * Verificações estáticas (leitura de arquivos-fonte, sem mocks, sem rede).
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

describe("Conteúdo completo do prompt não está mais no bundle público", () => {
  const publicComponents = [
    "src/components/bergamo/BergamoGallery.tsx",
    "src/components/bergamo/BergamoHero.tsx",
    "src/components/bergamo/BergamoPricing.tsx",
    "src/routes/bergamo.tsx",
  ];

  for (const file of publicComponents) {
    it(`${file} não importa mais o acervo estático com o texto completo dos prompts`, () => {
      const source = readSrc(file);
      expect(source).not.toMatch(/from\s+["']@\/data\/bergamo["']/);
      expect(source).not.toContain("BERGAMO_PROMPTS");
    });
  }

  it("BergamoGallery busca dados via server function, não via array estático", () => {
    const source = readSrc("src/components/bergamo/BergamoGallery.tsx");
    expect(source).toContain("BergamoCatalogItem");
  });

  it("a rota pública /bergamo usa o catálogo server-side (getBergamoPublicCatalogFn)", () => {
    const source = readSrc("src/routes/bergamo.tsx");
    expect(source).toContain("getBergamoPublicCatalogFn");
  });
});

describe("Magic link — redirect seguro, sem open redirect", () => {
  const source = readSrc("src/routes/auth.tsx");

  it("emailRedirectTo aponta para um caminho interno fixo, nunca para um parâmetro da URL", () => {
    expect(source).toMatch(/emailRedirectTo:\s*`\$\{window\.location\.origin\}\/membros`/);
    // Nunca lê redirect de query string, hash ou params — não há open redirect possível.
    expect(source).not.toMatch(/searchParams|location\.search|redirectTo\s*=\s*.*params/);
  });

  it("o destino pós-login é decidido pelo papel do usuário no servidor (roles), não por um parâmetro do cliente", () => {
    expect(source).toMatch(
      /router\.navigate\(\{\s*to:\s*isAdmin\s*\?\s*"\/admin"\s*:\s*"\/membros"\s*\}\)/,
    );
  });

  it("login por senha continua disponível (preservado para a equipe/administração)", () => {
    expect(source).toContain("signInWithPassword");
  });

  it("mensagem de envio do magic link é neutra (não confirma nem nega existência do e-mail)", () => {
    expect(source).toMatch(/se esse e-mail estiver associado/i);
  });

  it("existe cooldown client-side contra reenvio imediato do magic link", () => {
    expect(source).toContain("MAGIC_LINK_COOLDOWN_SECONDS");
  });
});

describe("Member — sem escrita direta do navegador em tabelas sensíveis", () => {
  it("as rotas de membros não importam o cliente Supabase do navegador", () => {
    for (const file of ["src/routes/membros.index.tsx", "src/routes/membros.bergamo.tsx"]) {
      const source = readSrc(file);
      expect(source).not.toMatch(/from\s+["']@\/integrations\/supabase\/client["']/);
    }
  });
});
