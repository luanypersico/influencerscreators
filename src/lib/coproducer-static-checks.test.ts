/** Verificações estáticas do workspace do coprodutor (leitura de arquivos, sem mocks). */
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

function readSrc(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

describe("Coproducer — sem escrita direta do navegador em tabelas sensíveis", () => {
  it("a rota /coprodutor/bergamo não importa o cliente Supabase do navegador", () => {
    const source = readSrc("src/routes/coprodutor.bergamo.tsx");
    expect(source).not.toMatch(/from\s+["']@\/integrations\/supabase\/client["']/);
  });

  it("coproducer.server.ts nunca escreve em orders, product_access, products ou payment_integrations", () => {
    const source = readSrc("src/lib/coproducer.server.ts");
    // As únicas tabelas mutadas por este módulo são product_items,
    // product_item_revisions e product_updates (conteúdo do Bergamo).
    // Ancorado diretamente em .from("tabela").<verbo>( — com espaço em
    // branco/quebra de linha tolerados no meio, mas sem "pular" para uma
    // mutação de OUTRA tabela mais adiante no arquivo.
    for (const table of ["orders", "product_access", "products", "payment_integrations"]) {
      for (const verb of ["update", "insert", "delete"]) {
        const pattern = new RegExp(`from\\("${table}"\\)\\s*\\.\\s*${verb}\\s*\\(`);
        expect(source).not.toMatch(pattern);
      }
    }
  });
});
