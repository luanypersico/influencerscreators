/**
 * Verificações estáticas (leitura de arquivos, sem mocks) da preparação
 * operacional do Bergamo: garante por inspeção do código-fonte — não só
 * por comportamento em teste — que a senha nunca é logada, que o ator
 * nunca vem do cliente, que a tela nova é restrita a super_admin e que
 * nenhuma escrita direta do navegador acontece nas tabelas sensíveis.
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

describe("bergamo-operational-access.server.ts — senha nunca logada", () => {
  const source = readSrc("src/lib/bergamo-operational-access.server.ts");

  it("nenhuma chamada a logAudit referencia a senha", () => {
    const auditBlocks = source.match(/await logAudit\(\{[\s\S]*?\n {2}\}\);/g) ?? [];
    expect(auditBlocks.length).toBeGreaterThan(0);
    for (const block of auditBlocks) {
      expect(block.toLowerCase()).not.toContain("password");
    }
  });

  it("a senha só é usada para chamadas ao Auth admin, nunca gravada em outra tabela", () => {
    // Toda ocorrência do literal `password: params.password` deve estar
    // dentro do bloco de uma chamada a createUser/updateUserById (Auth
    // admin) — nunca dentro de um payload de .insert()/.update() de uma
    // tabela do Postgres (profiles, product_access, product_collaborators).
    const assignments = [...source.matchAll(/password:\s*params\.password/g)];
    expect(assignments.length).toBeGreaterThan(0);
    for (const match of assignments) {
      const before = source.slice(Math.max(0, match.index! - 400), match.index!);
      const lastAuthCall = Math.max(
        before.lastIndexOf("createUser"),
        before.lastIndexOf("updateUserById"),
      );
      const lastTableWrite = Math.max(
        before.lastIndexOf('.from("profiles")'),
        before.lastIndexOf('.from("product_access")'),
        before.lastIndexOf('.from("product_collaborators")'),
      );
      expect(lastAuthCall).toBeGreaterThan(lastTableWrite);
    }
  });
});

describe("bergamo-operational-access.functions.ts — ator nunca vem do cliente", () => {
  const source = readSrc("src/lib/bergamo-operational-access.functions.ts");

  it("nenhum validator lê 'actorId' do payload bruto", () => {
    expect(source).not.toMatch(/raw\[["']actorId["']\]/);
  });

  it("todo handler usa context.userId como actorId", () => {
    const actorIdAssignments = [...source.matchAll(/actorId:\s*context\.userId/g)];
    expect(actorIdAssignments.length).toBeGreaterThan(0);
  });
});

describe("Painel 'Usuários do Bergamo' — restrito a super_admin", () => {
  it("o item de navegação está marcado como superAdminOnly", () => {
    const source = readSrc("src/routes/admin.tsx");
    expect(source).toMatch(
      /bergamo-usuarios["'],?\s*label:\s*["']Usuários do Bergamo["'],?\s*superAdminOnly:\s*true/,
    );
    expect(source).toMatch(
      /NAV\.filter\(\(item\) => !\("superAdminOnly" in item\) \|\| isSuperAdmin\)/,
    );
  });

  it("a página em si também recusa acesso quando não é super_admin (defesa em profundidade)", () => {
    const source = readSrc("src/routes/admin.bergamo-usuarios.tsx");
    expect(source).toMatch(/if \(!isSuperAdmin\)/);
  });

  it("a página não importa o cliente Supabase do navegador", () => {
    const source = readSrc("src/routes/admin.bergamo-usuarios.tsx");
    expect(source).not.toMatch(/from\s+["']@\/integrations\/supabase\/client["']/);
  });

  it("o diálogo de provisionamento nunca reexibe a senha após a criação", () => {
    const source = readSrc("src/components/admin/ProvisionValidationAccountDialog.tsx");
    expect(source).not.toMatch(/tempPassword/);
    expect(source).not.toMatch(/toast\.success\([^)]*password/i);
  });
});

describe("bergamo-operational-access.server.ts — sem escrita direta em tabelas fora de escopo", () => {
  it("nunca escreve em orders, payment_integrations, webhook_events ou products", () => {
    const source = readSrc("src/lib/bergamo-operational-access.server.ts");
    for (const table of ["orders", "payment_integrations", "webhook_events", "products"]) {
      for (const verb of ["update", "insert", "delete"]) {
        const pattern = new RegExp(`from\\("${table}"\\)\\s*\\.\\s*${verb}\\s*\\(`);
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("product_id nunca é aceito como parâmetro de entrada — sempre resolvido no servidor", () => {
    const source = readSrc("src/lib/bergamo-operational-access.server.ts");
    expect(source).not.toMatch(/params\.productId/);
    expect(source).not.toMatch(/params:\s*\{[^}]*productId/);
  });
});

describe("Migration — novas origens de product_access nunca se confundem com compra real", () => {
  it("adiciona manual_validation e coproducer_preview sem remover as origens comerciais existentes", () => {
    const source = readSrc("supabase/migrations/20260807162723_lovable_03a_keys_checks.sql");
    for (const value of [
      "manual",
      "purchase",
      "gift",
      "trial",
      "hotmart",
      "manual_validation",
      "coproducer_preview",
    ]) {
      expect(source).toContain(`'${value}'::text`);
    }
  });
});
