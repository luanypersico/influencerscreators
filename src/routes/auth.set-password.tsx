import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { usePostAuthDestination } from "@/hooks/usePostAuthDestination";
import { useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/set-password")({
  head: () => ({
    meta: [{ title: "Definir nova senha" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: SetPasswordPage,
});

const MINIMUM_PASSWORD_LENGTH = 12;

function SetPasswordPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const getPostAuthDestination = usePostAuthDestination();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!session || busy) return;

    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      toast.error(`Use pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmation) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setBusy(true);
    try {
      // This password only goes directly to Supabase Auth from the browser.
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      const destination = await getPostAuthDestination();
      toast.success("Senha definida com sucesso.");
      await router.navigate({ to: destination });
    } catch {
      toast.error("Não foi possível definir a nova senha. Solicite outro link.");
    } finally {
      setBusy(false);
      setPassword("");
      setConfirmation("");
    }
  }

  if (loading) return <CenteredPanel title="Validando link..." />;

  if (!session) {
    return (
      <CenteredPanel title="Link inválido ou expirado">
        <p className="mt-2 text-sm text-muted-foreground">
          Solicite um novo link para continuar com segurança.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth">Ir para entrar</Link>
        </Button>
      </CenteredPanel>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Toaster />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Acesso
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Defina sua nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use ao menos {MINIMUM_PASSWORD_LENGTH} caracteres e não reutilize uma senha exposta.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={MINIMUM_PASSWORD_LENGTH}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={MINIMUM_PASSWORD_LENGTH}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Salvando..." : "Definir senha"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function CenteredPanel({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {children}
      </div>
    </div>
  );
}
