import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { resolvePostAuthDestination } from "./post-auth-redirect.server";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

function readSrc(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

describe("fluxo de Auth do Supabase", () => {
  it("prioriza super_admin e admin para /admin", () => {
    expect(
      resolvePostAuthDestination({ roles: ["super_admin"], hasActiveBergamoCoproducerLink: true }),
    ).toBe("/admin");
    expect(
      resolvePostAuthDestination({ roles: ["admin"], hasActiveBergamoCoproducerLink: false }),
    ).toBe("/admin");
  });

  it("envia somente coprodutor ativo do Bergamo para o workspace", () => {
    expect(
      resolvePostAuthDestination({ roles: ["coproducer"], hasActiveBergamoCoproducerLink: true }),
    ).toBe("/coprodutor/bergamo");
    expect(
      resolvePostAuthDestination({ roles: ["coproducer"], hasActiveBergamoCoproducerLink: false }),
    ).toBe("/membros");
  });

  it("envia membro para /membros", () => {
    expect(
      resolvePostAuthDestination({ roles: ["member"], hasActiveBergamoCoproducerLink: false }),
    ).toBe("/membros");
  });

  it("usa dados reais do servidor, incluindo role, produto, vínculo e status", () => {
    const source = readSrc("src/lib/post-auth-redirect.server.ts");
    expect(source).toContain('from("user_roles")');
    expect(source).toContain('eq("slug", "bergamo")');
    expect(source).toContain('from("product_collaborators")');
    expect(source).toContain('eq("role", "coproducer")');
    expect(source).toContain('eq("status", "active")');
  });

  it("não deixa magic link criar usuário desconhecido e mantém mensagem neutra", () => {
    const source = readSrc("src/routes/auth.tsx");
    expect(source).toMatch(/signInWithOtp\([\s\S]*shouldCreateUser:\s*false/);
    expect(source).toMatch(/se esse e-mail estiver associado/i);
  });

  it("envia recovery para /auth/set-password", () => {
    const source = readSrc("src/routes/auth.tsx");
    expect(source).toContain("${window.location.origin}/auth/callback?next=/auth/set-password");
  });

  it("recusa set-password sem sessão e só atualiza senha após validar sessão", () => {
    const source = readSrc("src/routes/auth.set-password.tsx");
    expect(source).toContain("if (!session || busy) return;");
    expect(source).toContain("Link inválido ou expirado");
    expect(source).toContain("completePasswordSetup(supabase.auth, session, password)");
    expect(source).toContain("requirePasswordSetupProof: true");
  });

  it("não declara um convite implícito expirado antes do processamento do callback", () => {
    const source = readSrc("src/hooks/useSetPasswordSession.ts");
    expect(source).toContain('event === "SIGNED_IN"');
    expect(source).toContain('event === "PASSWORD_RECOVERY"');
    expect(source).toContain("AUTH_LINK_TIMEOUT_MS");
  });

  it("valida divergência e não envia senha a logs", () => {
    const source = readSrc("src/routes/auth.set-password.tsx");
    const proofSource = readSrc("src/hooks/passwordSetup.ts");
    expect(source).toContain("password !== confirmation");
    expect(source).not.toMatch(/console\.(log|info|warn|error)\([^)]*password/i);
    expect(proofSource).not.toMatch(/console\.(log|info|warn|error)/);
  });

  it("mantém /laboratorio sem alteração nesta rodada", () => {
    const source = readSrc("src/routes/laboratorio.tsx");
    expect(source).toContain('createFileRoute("/laboratorio")');
  });
});
