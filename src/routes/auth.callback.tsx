import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

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
        // The callback itself remains neutral; the timeout/error state handles failures.
      });
    return () => {
      active = false;
    };
  }, [getPostAuthDestination, router, session, state]);

  if (state === "processing" || state === "valid") return <Panel title="Validando seu acesso..." />;

  return (
    <Panel title="Link inválido ou expirado">
      <Button asChild className="mt-6">
        <Link to="/auth">Ir para entrar</Link>
      </Button>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {children}
      </div>
    </div>
  );
}
