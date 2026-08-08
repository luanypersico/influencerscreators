/** Verificações estáticas (leitura de arquivos-fonte, sem mocks, sem rede). */
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
    expect(readSrc("src/components/bergamo/BergamoGallery.tsx")).toContain("BergamoCatalogItem");
  });

  it("a rota pública /bergamo usa o catálogo server-side", () => {
    expect(readSrc("src/routes/bergamo.tsx")).toContain("getBergamoPublicCatalogFn");
  });
});

describe("Área do aluno — ativação única e login com senha", () => {
  const buyerSource = readSrc("src/routes/auth.tsx");
  const teamSource = readSrc("src/routes/equipe.tsx");

  it("primeiro acesso envia recuperação para o caminho interno fixo de criação de senha", () => {
    expect(buyerSource).toContain("resetPasswordForEmail");
    expect(buyerSource).toContain(
      "${window.location.origin}/auth/callback?next=/auth/set-password",
    );
    expect(buyerSource).not.toMatch(/searchParams|location\.search|redirectTo\s*=\s*.*params/);
  });

  it("comprador retorna com e-mail e senha, com destino decidido pelo servidor", () => {
    expect(buyerSource).toContain("signInWithPassword");
    expect(buyerSource).toContain("getPostAuthDestination()");
    expect(buyerSource).toContain("router.navigate({ to: destination })");
  });

  it("não cria usuário pelo browser e mantém resposta neutra", () => {
    expect(buyerSource).not.toContain("signUp(");
    expect(buyerSource).not.toContain("signInWithOtp");
    expect(buyerSource).toMatch(/se esse e-mail estiver associado/i);
  });

  it("não expõe acesso da equipe na experiência do comprador", () => {
    expect(buyerSource).not.toMatch(/sou da equipe|acesso da equipe|e-mail operacional/i);
    expect(buyerSource).not.toContain('to="/equipe"');
    expect(teamSource).toContain('createFileRoute("/equipe")');
    expect(teamSource).toContain("signInWithPassword");
  });

  it("usa somente imagens públicas de preview no shell visual", () => {
    const source = readSrc("src/components/auth/AuthExperienceShell.tsx");
    expect(source).toContain("bergamoImage");
    expect(source).not.toMatch(/assets\/bergamo\/gallery/);
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
