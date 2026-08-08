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

  it("coproducer.server.ts nunca escreve em orders, products ou payment_integrations", () => {
    const source = readSrc("src/lib/coproducer.server.ts");
    // Além do conteúdo do Bergamo, este módulo só pode mutar
    // product_access com a origem manual de cortesia e o log de auditoria.
    // Ancorado diretamente em .from("tabela").<verbo>( — com espaço em
    // branco/quebra de linha tolerados no meio, mas sem "pular" para uma
    // mutação de OUTRA tabela mais adiante no arquivo.
    for (const table of ["orders", "products", "payment_integrations"]) {
      for (const verb of ["update", "insert", "delete"]) {
        const pattern = new RegExp(`from\\("${table}"\\)\\s*\\.\\s*${verb}\\s*\\(`);
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("a cortesia usa somente source manual e nunca escreve em user_roles", () => {
    const source = readSrc("src/lib/coproducer.server.ts");
    expect(source).toContain('source: "manual"');
    expect(source).toContain('.eq("source", "manual")');
    expect(source).not.toMatch(/from\("user_roles"\)\s*\.\s*(insert|update|delete)\s*\(/);
  });

  it("convite Auth fica no servidor e usa redirect de allowlist, nunca dado do browser", () => {
    const serverSource = readSrc("src/lib/coproducer.server.ts");
    const functionsSource = readSrc("src/lib/coproducer.functions.ts");
    expect(serverSource).toContain("auth.admin.inviteUserByEmail");
    expect(serverSource).toContain("getBergamoInviteRedirectUrl()");
    expect(functionsSource).not.toMatch(/raw\["(?:productId|product_id|role|redirectTo|order)"\]/);
  });

  it("a UI oferece somente nome, e-mail e observação para a cortesia", () => {
    const routeSource = readSrc("src/routes/coprodutor.bergamo.tsx");
    expect(routeSource).toContain("+ Adicionar cliente");
    expect(routeSource).toContain("Conceder acesso cortesia");
    expect(routeSource).toContain("Revogar cortesia");
    expect(routeSource).not.toMatch(/courtesy-password|type="password"/);
  });
});

describe("Coproducer — logout do workspace", () => {
  const routeSource = readSrc("src/routes/coprodutor.bergamo.tsx");
  const logoutSource = readSrc("src/hooks/useLogout.ts");

  it("exibe a acao Sair no cabecalho do workspace", () => {
    expect(routeSource).toMatch(/actions=\{/);
    expect(routeSource).toContain('"Sair"');
    expect(routeSource).toContain("void handleLogout()");
  });

  it("usa o logout oficial, limpa o cache e redireciona sem open redirect", () => {
    expect(logoutSource).toContain("auth.signOut()");
    expect(logoutSource).toContain("queryClient.clear()");
    expect(logoutSource).toContain('router.navigate({ to: "/auth", replace: true })');
  });

  it("mantem a protecao da rota depois que a sessao e removida", () => {
    expect(routeSource).toContain('if (!loading && !session) router.navigate({ to: "/auth" })');
    expect(routeSource).toMatch(/enabled:\s*Boolean\(session\)/);
    expect(routeSource).toMatch(/if \(!session\)/);
  });
});
