import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { AuthExperienceShell } from "@/components/auth/AuthExperienceShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/invite")({ component: InvitePage });

function InvitePage() {
  const router = useRouter();
  const [state, setState] = useState<"ready" | "busy" | "invalid">("ready");

  async function confirmInvite() {
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    if (!token_hash || params.get("type") !== "invite") return setState("invalid");

    setState("busy");
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: "invite" });
      if (error) return setState("invalid");

      window.history.replaceState(null, "", "/auth/set-password");
      await router.navigate({ to: "/auth/set-password" });
    } catch {
      // A client bootstrap or network error must never leave the invite UI
      // in its pending state, and it must not expose auth internals.
      setState("invalid");
    }
  }

  const invalid = state === "invalid";
  return (
    <AuthExperienceShell
      badge="Acesso seguro"
      title={invalid ? "Link inválido ou expirado" : "Seu acesso está pronto."}
      description={
        invalid
          ? "Este convite já foi usado ou expirou. Solicite um novo link."
          : "Confirme para criar sua senha de acesso ao Arsenal de Prompts."
      }
    >
      {invalid ? (
        <Button asChild className="bergamo-cta mt-6 h-11 rounded-xl border-0 px-6 text-white">
          <Link to="/auth">Solicitar novo link</Link>
        </Button>
      ) : (
        <Button
          type="button"
          onClick={() => void confirmInvite()}
          disabled={state === "busy"}
          className="bergamo-cta mt-6 h-11 w-full rounded-xl border-0 px-6 text-white"
        >
          {state === "busy" ? "Validando..." : "Criar minha senha e acessar"}
        </Button>
      )}
    </AuthExperienceShell>
  );
}
