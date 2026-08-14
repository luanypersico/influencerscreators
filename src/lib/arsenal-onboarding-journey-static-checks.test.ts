/**
 * Verificações estáticas (leitura de arquivos-fonte, sem mocks) da jornada
 * pós-criação-de-senha: o formulário não pode permanecer/reaparecer depois
 * do sucesso, a navegação para /membros deve usar replace, o disparo do
 * welcome email nunca pode bloquear ou desfazer o acesso, e o marcador de
 * onboarding nunca vira autoridade de segurança (a troca de senha continua
 * gated só por passwordSetup.ts, intocado nesta rodada).
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

describe("auth.set-password.tsx — o formulário nunca reaparece depois do sucesso", () => {
  const source = readSrc("src/routes/auth.set-password.tsx");

  it("tem um estado terminal `completed`, verificado antes de processing/invalid no render", () => {
    const completedCheck = source.indexOf("if (completed)");
    const processingCheck = source.indexOf('state === "processing"');
    const invalidCheck = source.indexOf('state === "invalid"');
    expect(completedCheck).toBeGreaterThan(-1);
    expect(completedCheck).toBeLessThan(processingCheck);
    expect(completedCheck).toBeLessThan(invalidCheck);
  });

  it("marca completed=true logo após completePasswordSetup, antes de qualquer novo await", () => {
    const doneIdx = source.indexOf("await completePasswordSetup(");
    const completedIdx = source.indexOf("setCompleted(true)");
    const nextAwaitIdx = source.indexOf("await getPostAuthDestination()");
    expect(doneIdx).toBeGreaterThan(-1);
    expect(completedIdx).toBeGreaterThan(doneIdx);
    expect(completedIdx).toBeLessThan(nextAwaitIdx);
  });

  it("handleSubmit ignora novo submit depois de completed (evita duplo submit)", () => {
    expect(source).toMatch(/if \(!session \|\| busy \|\| completed\) return;/);
  });

  it("navega para o destino com replace: true (Back não volta pro onboarding concluído)", () => {
    expect(source).toMatch(
      /router\.navigate\(\{\s*to:\s*destination,\s*replace:\s*true\s*\}\)/,
    );
  });

  it("dispara o onboarding/welcome email sem bloquear a navegação (fire-and-forget, com catch)", () => {
    const triggerIdx = source.indexOf("void completeArsenalOnboarding()");
    const navigateIdx = source.indexOf("router.navigate({ to: destination, replace: true })");
    expect(triggerIdx).toBeGreaterThan(-1);
    expect(triggerIdx).toBeLessThan(navigateIdx);
    expect(source.slice(triggerIdx, triggerIdx + 80)).toContain(".catch(");
  });

  it("não usa timers/gambiarra visual (setTimeout) para esconder o formulário", () => {
    expect(source).not.toContain("setTimeout");
  });
});

describe("arsenal-onboarding-welcome.functions.ts — nunca aceita userId do cliente", () => {
  const source = readSrc("src/lib/arsenal-onboarding-welcome.functions.ts");

  it("é protegido por requireSupabaseAuth e usa só context.userId", () => {
    expect(source).toContain("requireSupabaseAuth");
    expect(source).toMatch(/completeArsenalOnboarding\(context\.userId\)/);
  });
});

describe("passwordSetup.ts continua a única autoridade de troca de senha — intocado nesta rodada", () => {
  const source = readSrc("src/hooks/passwordSetup.ts");

  it("getPasswordSetupMethod ainda exige AMR otp e sub/exp válidos (gate não enfraquecido)", () => {
    expect(source).toContain('latest.method !== "otp"');
    expect(source).toContain("claims.sub !== expectedUserId");
  });

  it("nenhum marcador de onboarding (arsenal.onboarding.*) vira autoridade de troca de senha", () => {
    expect(source).not.toMatch(/arsenal\.onboarding|admin_audit_log/);
  });
});

describe("Áreas protegidas continuam intocadas por esta rodada", () => {
  it("arsenal-onboarding-welcome.server.ts nunca referencia Hotmart/orders/product_access", () => {
    const source = readSrc("src/lib/arsenal-onboarding-welcome.server.ts");
    expect(source).not.toMatch(/hotmart|orders|product_access|has_product_access/i);
  });

  it("a chave Resend nunca é lida fora de um módulo *.server.ts (nunca no browser)", () => {
    const source = readSrc("src/lib/arsenal-onboarding-welcome.server.ts");
    expect(source).not.toContain("RESEND_API_KEY");
    expect(source).toContain("sendEmails");
  });
});
