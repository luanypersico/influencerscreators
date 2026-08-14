import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { completeArsenalOnboarding } from "./arsenal-onboarding-welcome.server";

/**
 * Chamado uma única vez, logo após a senha ser criada com sucesso (sessão
 * já reautenticada com a nova senha). Sempre opera sobre context.userId —
 * nunca aceita um userId do cliente, mesmo padrão de memberGetMyAccessFn.
 */
export const completeArsenalOnboardingFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => completeArsenalOnboarding(context.userId));
