import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

type AuditRow = { action: string; entity: string | null; entity_id: string | null };

let audit: AuditRow[] = [];
let emailMessages: { to_email: string; subject: string; status: string }[] = [];
let profileEmail: string | null = "aluno@example.com";
let fromEmailConfigured = true;
let resendOk = true;

mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from(table: string) {
      if (table === "admin_audit_log") {
        return {
          select: () => ({
            eq: (_col: string, action: string) => ({
              eq: () => ({
                eq: (_c: string, entityId: string) => ({
                  limit: () =>
                    Promise.resolve({
                      data: audit.some((a) => a.action === action && a.entity_id === entityId)
                        ? [{ id: "existing" }]
                        : [],
                      error: null,
                    }),
                }),
              }),
            }),
          }),
          insert: (row: AuditRow) => {
            audit.push(row);
            return Promise.resolve({ data: null, error: null });
          },
        };
      }
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({ data: profileEmail ? { email: profileEmail } : null, error: null }),
            }),
          }),
        };
      }
      if (table === "app_settings") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: fromEmailConfigured
                    ? { value: { from_email: "arsenal@obergamo.com.br", from_name: "Arsenal" } }
                    : { value: {} },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === "email_messages") {
        return {
          insert: (row: { to_email: string; subject: string; status: string }) => {
            emailMessages.push(row);
            return Promise.resolve({ data: null, error: null });
          },
        };
      }
      throw new Error(`unmocked table ${table}`);
    },
  },
}));

const originalFetch = globalThis.fetch;

const { completeArsenalOnboarding, buildArsenalWelcomeEmailHtml } = await import(
  "./arsenal-onboarding-welcome.server"
);

beforeEach(() => {
  audit = [];
  emailMessages = [];
  profileEmail = "aluno@example.com";
  fromEmailConfigured = true;
  resendOk = true;
  process.env["RESEND_API_KEY"] = "test-key";
  globalThis.fetch = (async () =>
    resendOk
      ? new Response(JSON.stringify({ id: "resend-id" }), { status: 200 })
      : new Response(JSON.stringify({ message: "Resend indisponível" }), {
          status: 500,
        })) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env["RESEND_API_KEY"];
});

describe("completeArsenalOnboarding — marca conclusão e dispara o e-mail de boas-vindas uma única vez", () => {
  it("na primeira conclusão: registra arsenal.onboarding.completed e envia o e-mail", async () => {
    const result = await completeArsenalOnboarding("user-1");
    expect(result).toEqual({ alreadyCompleted: false, welcomeEmailSent: true });
    expect(audit.some((a) => a.action === "arsenal.onboarding.completed")).toBe(true);
    expect(audit.some((a) => a.action === "arsenal.welcome_email.sent")).toBe(true);
    expect(emailMessages).toHaveLength(1);
    expect(emailMessages[0]?.to_email).toBe("aluno@example.com");
  });

  it("idempotente: uma segunda chamada para o mesmo usuário não reenvia o e-mail", async () => {
    await completeArsenalOnboarding("user-2");
    emailMessages = [];
    const second = await completeArsenalOnboarding("user-2");
    expect(second).toEqual({ alreadyCompleted: true, welcomeEmailSent: false });
    expect(emailMessages).toHaveLength(0);
    expect(audit.filter((a) => a.action === "arsenal.onboarding.completed")).toHaveLength(1);
  });

  it("onboarding de usuários diferentes não interfere entre si (chave é o userId)", async () => {
    await completeArsenalOnboarding("user-3");
    const other = await completeArsenalOnboarding("user-4");
    expect(other.alreadyCompleted).toBe(false);
  });

  it("falha no envio (Resend fora do ar) não lança — onboarding já foi marcado como concluído", async () => {
    resendOk = false;
    const result = await completeArsenalOnboarding("user-5");
    expect(result.alreadyCompleted).toBe(false);
    expect(result.welcomeEmailSent).toBe(false);
    expect(audit.some((a) => a.action === "arsenal.onboarding.completed")).toBe(true);
    expect(audit.some((a) => a.action === "arsenal.welcome_email.failed")).toBe(true);
  });

  it("sem chave Resend configurada: não lança, registra a falha", async () => {
    delete process.env["RESEND_API_KEY"];
    const result = await completeArsenalOnboarding("user-6");
    expect(result.alreadyCompleted).toBe(false);
    expect(result.welcomeEmailSent).toBe(false);
    expect(audit.some((a) => a.action === "arsenal.welcome_email.failed")).toBe(true);
  });

  it("sem e-mail no profile: marca concluído, mas não tenta enviar nem falha", async () => {
    profileEmail = null;
    const result = await completeArsenalOnboarding("user-7");
    expect(result).toEqual({ alreadyCompleted: false, welcomeEmailSent: false });
    expect(emailMessages).toHaveLength(0);
    expect(audit.some((a) => a.action === "arsenal.welcome_email.failed")).toBe(false);
  });
});

describe("buildArsenalWelcomeEmailHtml — conteúdo do e-mail de boas-vindas", () => {
  const html = buildArsenalWelcomeEmailHtml();

  it("aponta o CTA para /membros no domínio real do Arsenal", () => {
    expect(html).toContain("https://arsenal.obergamo.com.br/membros");
    expect(html).toContain("ACESSAR MINHA ÁREA");
  });

  it("usa o mesmo logo já aprovado para os e-mails do Arsenal", () => {
    expect(html).toContain(
      "https://res.cloudinary.com/duht4tq1f/image/upload/v1786219372/Design_sem_nome_3_qdxjsd.png",
    );
  });

  it("mensagem confirma que o acesso está pronto, sem pedir para criar senha de novo", () => {
    expect(html).toContain("Seu acesso está pronto");
    expect(html).not.toMatch(/criar (sua|nova) senha/i);
  });
});
