import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthExperienceShell } from "@/components/auth/AuthExperienceShell";
import { Button } from "@/components/ui/button";
import { getSafeAuthCallbackNext } from "@/hooks/authCallback";
import { usePostAuthDestination } from "@/hooks/usePostAuthDestination";
import { useSetPasswordSession } from "@/hooks/useSetPasswordSession";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const router = useRouter();
  const { session, state } = useSetPasswordSession();
  const getPostAuthDestination = usePostAuthDestination();

  useEffect(() => {
    if (state !== "valid" || !session) return;
    const next = getSafeAuthCallbackNext(window.location.search);
    let active = true;

    void (next === "/auth/set-password" ? Promise.resolve(next) : getPostAuthDestination())
      .then((destination) => {
        if (active) void router.navigate({ to: destination });
      })
      .catch(() => {
        // The callback remains neutral; the timeout/error state handles failures.
      });
    return () => {
      active = false;
    };
  }, [getPostAuthDestination, router, session, state]);

  if (state === "processing" || state === "valid") return <Panel title="Validando seu acesso..." />;

  return (
    <Panel title="Link inválido ou expirado">
      <Button asChild className="bergamo-cta mt-6 h-11 rounded-xl border-0 px-6 text-white">
        <Link to="/auth">Solicitar um novo link</Link>
      </Button>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <AuthExperienceShell
      badge="Acesso seguro"
      title="Abrindo as portas do seu acervo."
      description="Estamos confirmando sua identidade e verificando qual conteúdo está liberado para a sua conta."
    >
      <div className="py-5 text-center">
        <span className="mx-auto block size-12 animate-pulse rounded-full bg-primary/25 shadow-[0_0_45px_color-mix(in_oklab,var(--primary)_70%,transparent)]" />
        <h1 className="mt-5 font-display text-2xl text-white">{title}</h1>
        {children}
      </div>
    </AuthExperienceShell>
  );
}
