import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { logAudit, sendEmails } from "./admin.server";
import { ARSENAL_ORIGIN } from "./auth-invite.server";

const ONBOARDING_COMPLETED_ACTION = "arsenal.onboarding.completed";
const WELCOME_EMAIL_SENT_ACTION = "arsenal.welcome_email.sent";
const WELCOME_EMAIL_FAILED_ACTION = "arsenal.welcome_email.failed";

export interface ArsenalOnboardingCompletionResult {
  alreadyCompleted: boolean;
  welcomeEmailSent: boolean;
}

async function hasCompletedArsenalOnboarding(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("admin_audit_log")
    .select("id")
    .eq("action", ONBOARDING_COMPLETED_ACTION)
    .eq("entity", "user")
    .eq("entity_id", userId)
    .limit(1);
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

// Mesma URL já aprovada em src/components/brand/ArsenalLogo.tsx — duplicada
// aqui (em vez de importada) para manter este módulo server-only isolado de
// componentes React.
const ARSENAL_LOGO_URL =
  "https://res.cloudinary.com/duht4tq1f/image/upload/v1786219372/Design_sem_nome_3_qdxjsd.png";

export function buildArsenalWelcomeEmailHtml(): string {
  const membersUrl = `${ARSENAL_ORIGIN}/membros`;
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#0b0710;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0710;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#150c1f;border:1px solid #2c1b3d;border-radius:24px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:32px 32px 8px;">
                <img src="${ARSENAL_LOGO_URL}" alt="Arsenal de Prompts" width="140" style="display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px;text-align:center;">
                <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c76bff;font-weight:700;">
                  Bem-vindo
                </p>
                <h1 style="margin:12px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">
                  Seu acesso está pronto.
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0;text-align:center;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.72);">
                  Agora você já pode entrar no Arsenal sempre que quiser usando seu e-mail e a
                  senha que acabou de criar.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 32px;">
                <a
                  href="${membersUrl}"
                  style="display:inline-block;background:linear-gradient(135deg,#c76bff,#7c3aed);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.4px;padding:14px 32px;border-radius:999px;"
                >
                  ACESSAR MINHA ÁREA
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.45);">
                  Nas próximas vezes, entre normalmente com seu e-mail e senha.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Marca a conclusão do onboarding do Arsenal e dispara o e-mail de
 * boas-vindas — uma única vez por usuário. Idempotente via admin_audit_log
 * (mesma infraestrutura de auditoria já usada em todo o admin, sem tabela
 * nova). Nunca lança: a troca de senha e o acesso já são reais nesse ponto
 * do fluxo; uma falha de e-mail (Resend fora do ar, remetente não
 * configurado etc.) é registrada e ignorada, nunca desfaz o onboarding.
 */
export async function completeArsenalOnboarding(
  userId: string,
): Promise<ArsenalOnboardingCompletionResult> {
  if (await hasCompletedArsenalOnboarding(userId)) {
    return { alreadyCompleted: true, welcomeEmailSent: false };
  }

  await logAudit({
    actorId: userId,
    action: ONBOARDING_COMPLETED_ACTION,
    entity: "user",
    entityId: userId,
  });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  const email = profile?.email;
  if (!email) return { alreadyCompleted: false, welcomeEmailSent: false };

  try {
    const result = await sendEmails({
      actorId: userId,
      recipients: [email],
      subject: "Bem-vindo ao Arsenal de Prompts",
      html: buildArsenalWelcomeEmailHtml(),
    });

    if (result.sent > 0) {
      await logAudit({
        actorId: userId,
        action: WELCOME_EMAIL_SENT_ACTION,
        entity: "user",
        entityId: userId,
      });
      return { alreadyCompleted: false, welcomeEmailSent: true };
    }

    await logAudit({
      actorId: userId,
      action: WELCOME_EMAIL_FAILED_ACTION,
      entity: "user",
      entityId: userId,
      meta: { errors: result.errors },
    });
    return { alreadyCompleted: false, welcomeEmailSent: false };
  } catch (err) {
    await logAudit({
      actorId: userId,
      action: WELCOME_EMAIL_FAILED_ACTION,
      entity: "user",
      entityId: userId,
      meta: { error: err instanceof Error ? err.message : "Erro desconhecido" },
    });
    return { alreadyCompleted: false, welcomeEmailSent: false };
  }
}
