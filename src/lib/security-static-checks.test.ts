/**
 * Verificações estáticas de segurança (leitura de arquivos-fonte, sem
 * mocks e sem rede). Complementam os testes de comportamento em
 * hotmart.server.test.ts e admin-integrations.server.test.ts.
 *
 * O check de bundle (nenhum segredo no build gerado) só roda quando
 * `.output/public` já existe — em `bun run build` mais recente. Se não
 * existir ainda, o teste é pulado explicitamente (não falha em falso,
 * não finge ter verificado). A validação real desta rodada rodou
 * `bun run build` seguido de grep manual — ver relatório de entrega.
 */
import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

function readSrc(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

function walk(dir: string): string[] {
  const full = join(ROOT, dir);
  if (!existsSync(full)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(full)) {
    const abs = join(full, entry);
    const rel = join(dir, entry);
    if (statSync(abs).isDirectory()) {
      out.push(...walk(rel));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(rel);
    }
  }
  return out;
}

describe("admin.integracoes.tsx não acessa payment_integrations diretamente", () => {
  const source = readSrc("src/routes/admin.integracoes.tsx");

  it("não referencia a tabela payment_integrations", () => {
    expect(source).not.toContain("payment_integrations");
  });

  it("não chama supabase.from(...) — toda leitura/escrita passa por server functions", () => {
    expect(source).not.toMatch(/supabase\s*\.\s*from\s*\(/);
  });

  it("não importa o cliente supabase do navegador", () => {
    expect(source).not.toMatch(/from\s+["']@\/integrations\/supabase\/client["']/);
  });

  it("importa as server functions dedicadas da integração", () => {
    expect(source).toContain("@/lib/admin-integrations.functions");
  });

  it("não contém input, estado ou salvamento de Hottok (só o indicador hottok_configured)", () => {
    // Qualquer ocorrência de "hottok" nesta página só pode ser a palavra em texto
    // de orientação ao usuário ou o campo hottok_configured — nunca um campo de
    // formulário, estado ou leitura de valor real do token.
    expect(source).not.toMatch(/type=\{showToken/i);
    expect(source).not.toMatch(/form\.hottok\b/);
    expect(source).not.toMatch(/hottok:\s*form/i);
    expect(source).not.toMatch(/["']Ver["']|["']Ocultar["']/);
  });
});

describe("nenhum módulo client-side importa arquivos .server.ts diretamente", () => {
  const CLIENT_DIRS = ["src/routes", "src/components", "src/hooks", "src/features"];
  const FORBIDDEN_SPECIFIERS = [
    "hotmart.server",
    "admin-integrations.server",
    "admin.server",
    "client.server",
  ];

  // A própria rota do webhook faz `await import("@/lib/hotmart.server")` DENTRO
  // do handler de servidor — isso é o padrão correto (import dinâmico, nunca
  // top-level, então nunca entra no bundle do cliente). É a única exceção.
  const ALLOWLIST = ["src/routes/api/public/webhooks/hotmart.ts"];

  for (const dir of CLIENT_DIRS) {
    for (const file of walk(dir)) {
      if (ALLOWLIST.includes(file)) continue;

      it(`${file} não importa módulos server-only estaticamente`, () => {
        const content = readSrc(file);
        // Remove linhas de import dinâmico (await import(...)) antes de checar,
        // já que essas são seguras (never bundladas no cliente).
        const withoutDynamicImports = content.replace(/await\s+import\([^)]*\)/g, "");
        for (const specifier of FORBIDDEN_SPECIFIERS) {
          const staticImportPattern = new RegExp(`import[^;]*from\\s+["'][^"']*${specifier}["']`);
          expect(withoutDynamicImports).not.toMatch(staticImportPattern);
        }
      });
    }
  }
});

describe("bundle do navegador (best-effort — requer build recente)", () => {
  const publicDir = join(ROOT, ".output", "public");
  const hasBuild = existsSync(publicDir);

  it.skipIf(!hasBuild)("não contém a service role key nem o módulo hotmart.server", () => {
    const offenders: string[] = [];
    const scan = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const abs = join(dir, entry);
        if (statSync(abs).isDirectory()) {
          scan(abs);
        } else if (/\.(js|mjs)$/.test(entry)) {
          const content = readFileSync(abs, "utf8");
          if (
            content.includes("SUPABASE_SERVICE_ROLE_KEY") ||
            content.includes("process_hotmart_event")
          ) {
            offenders.push(abs);
          }
        }
      }
    };
    scan(publicDir);
    expect(offenders).toEqual([]);
  });

  if (!hasBuild) {
    it("build ainda não gerado nesta execução — checagem de bundle pulada (rode `bun run build` antes)", () => {
      expect(true).toBe(true);
    });
  }
});
