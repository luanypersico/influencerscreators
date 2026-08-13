/**
 * Verificações estáticas (leitura de arquivos-fonte, sem mocks) da
 * vitrine pública protegida do Bergamo: garante, por inspeção do
 * código-fonte, que nenhum componente alcançável pelo navegador público
 * importa os originais em alta resolução, que a cópia de bloqueio
 * (cadeado/CTA) existe, e que a barreira de captura/impressão está
 * ligada nas páginas certas.
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

describe("bergamoAssets.ts — só importa a pasta pública de previews", () => {
  const source = readSrc("src/data/bergamoAssets.ts");

  it("faz glob apenas de src/assets/bergamo/previews", () => {
    expect(source).toContain('"../assets/bergamo/previews/*.jpg"');
  });

  it("nunca importa src/assets/bergamo/gallery (originais em alta resolução)", () => {
    // Verificação precisa no import.meta.glob real, não em comentários que
    // citam "gallery" só para documentar o que NÃO se deve fazer.
    expect(source).not.toMatch(/import\.meta\.glob[^;]*bergamo\/gallery/);
  });
});

describe("Componentes públicos do Bergamo nunca importam os originais diretamente", () => {
  const files = [
    "src/components/bergamo/BergamoGallery.tsx",
    "src/components/bergamo/BergamoHero.tsx",
    "src/routes/prompts.tsx",
  ];

  for (const file of files) {
    it(`${file} não referencia bergamo/gallery`, () => {
      const source = readSrc(file);
      expect(source).not.toMatch(/assets\/bergamo\/gallery/);
    });
  }
});

describe("Cartão bloqueado — cópia e cadeado exigidos pela vitrine protegida", () => {
  const source = readSrc("src/components/bergamo/BergamoGallery.tsx");

  it("mostra o texto 'Disponível na área de membros' para itens bloqueados", () => {
    expect(source).toContain("Disponível na área de membros");
  });

  it("mostra o CTA 'Desbloquear os 90 prompts' para itens bloqueados", () => {
    expect(source).toContain("Desbloquear os 90 prompts");
  });

  it("usa o ícone de cadeado no overlay do item bloqueado", () => {
    expect(source).toMatch(/<Lock\b/);
  });

  it("decide o estado bloqueado pela presença do prompt vindo do servidor", () => {
    expect(source).toMatch(/locked\s*=\s*!item\.prompt/);
    expect(source).toMatch(/item\.isFree\s*\?\s*"Ver prompt grátis"\s*:\s*"Ver prompt completo"/);
  });
});

describe("Proteção sem cortina visual intrusiva", () => {
  it("/prompts não renderiza a cortina escura e mantém o bloqueio de impressão", () => {
    const source = readSrc("src/routes/prompts.tsx");
    expect(source).not.toContain("PrivacyCurtain");
    expect(source).toContain("protected-content");
    expect(source).toContain("print-protected-notice");
  });

  it("o legado /membros/bergamo redireciona sem renderizar conteúdo protegido", () => {
    const source = readSrc("src/routes/membros.bergamo.tsx");
    expect(source).not.toContain("PrivacyCurtain");
    expect(source).toContain('to: isArsenalHostname(hostname) ? "/prompts" : "/membros"');
    expect(source).not.toContain("protected-content");
    expect(source).not.toContain("print-protected-notice");
  });

  it("/laboratorio permanece intacto — não recebe a barreira desta rodada", () => {
    const source = readSrc("src/routes/laboratorio.tsx");
    expect(source).not.toMatch(/PrivacyCurtain|SessionWatermark/);
  });

  it("o CSS global bloqueia impressão do conteúdo protegido e mostra o aviso", () => {
    const css = readSrc("src/styles.css");
    expect(css).not.toContain(".privacy-curtain");
    expect(css).toMatch(
      /@media print[\s\S]*\.protected-content[\s\S]*display:\s*none\s*!important/,
    );
    expect(css).toMatch(/\.print-protected-notice[\s\S]*display:\s*block\s*!important/);
  });
});
