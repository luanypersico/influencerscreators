import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthExperienceShell } from "@/components/auth/AuthExperienceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { completePasswordSetup } from "@/hooks/passwordSetup";
import { usePostAuthDestination } from "@/hooks/usePostAuthDestination";
import { useSetPasswordSession } from "@/hooks/useSetPasswordSession";
import { supabase } from "@/integrations/supabase/client";
import { ARSENAL_ORIGIN } from "@/lib/hostname.functions";

export const Route = createFileRoute("/auth/set-password")({
  head: () => ({
    meta: [{ title: "Definir nova senha" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: SetPasswordPage,
});

const MINIMUM_PASSWORD_LENGTH = 12;

function SetPasswordPage() {
  const router = useRouter();
  const { session, state } = useSetPasswordSession({ requirePasswordSetupProof: true });
  const getPostAuthDestination = usePostAuthDestination();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      // The password goes only to Supabase Auth after the signed recovery/invite
      // claim is revalidated for this exact authenticated user.
      await completePasswordSetup(supabase.auth, session, password);

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

  if (state === "processing") return <CenteredPanel title="Validando seu link..." />;

  if (state === "invalid" || !session) {
    return (
      <CenteredPanel title="Link inválido ou expirado">
        <p className="mt-3 text-sm text-white/60">
          Solicite um novo link para continuar com segurança.
        </p>
        <Button asChild className="bergamo-cta mt-6 h-11 rounded-xl border-0 px-6 text-white">
          <a href={`${ARSENAL_ORIGIN}/entrar`}>Ir para a área do aluno</a>
        </Button>
      </CenteredPanel>
    );
  }

  return (
    <AuthExperienceShell
      badge="Última etapa"
      title="Crie sua senha e entre no acervo."
      description="A compra já está vinculada ao seu e-mail. Agora escolha uma senha forte para acessar os 90 prompts sempre que quiser."
      highlights={[
        "Sua senha vai diretamente para o Supabase Auth",
        "O link é validado novamente antes da alteração",
      ]}
    >
      <Toaster />
      <form onSubmit={handleSubmit} className="w-full">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
          Ativação segura
        </p>
        <h2 className="mt-2 font-display text-2xl text-white">Defina sua nova senha</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Use ao menos {MINIMUM_PASSWORD_LENGTH} caracteres e não reutilize uma senha exposta.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white/80">
              Nova senha
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={MINIMUM_PASSWORD_LENGTH}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-xl border-white/15 bg-black/25 pr-12 pl-4 text-white focus-visible:border-primary"
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="size-4.5" aria-hidden="true" />
                ) : (
                  <Eye className="size-4.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white/80">
              Confirmar nova senha
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmation ? "text" : "password"}
                autoComplete="new-password"
                minLength={MINIMUM_PASSWORD_LENGTH}
                required
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="h-12 rounded-xl border-white/15 bg-black/25 pr-12 pl-4 text-white focus-visible:border-primary"
              />
              <button
                type="button"
                aria-label={showConfirmation ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showConfirmation}
                title={showConfirmation ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowConfirmation((visible) => !visible)}
                className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {showConfirmation ? (
                  <EyeOff className="size-4.5" aria-hidden="true" />
                ) : (
                  <Eye className="size-4.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="bergamo-cta h-12 w-full rounded-xl border-0 font-bold text-white"
            disabled={busy}
          >
            {busy ? "Salvando..." : "Criar senha e entrar"}
          </Button>
        </div>
      </form>
    </AuthExperienceShell>
  );
}

function CenteredPanel({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <AuthExperienceShell
      badge="Validação de acesso"
      title="Protegendo o seu acervo."
      description="Validamos o link diretamente com o serviço de autenticação antes de permitir qualquer alteração na conta."
    >
      <Toaster />
      <div className="py-5 text-center">
        <span className="mx-auto block size-12 animate-pulse rounded-full bg-primary/25 shadow-[0_0_45px_color-mix(in_oklab,var(--primary)_70%,transparent)]" />
        <h1 className="mt-5 font-display text-2xl text-white">{title}</h1>
        {children}
      </div>
    </AuthExperienceShell>
  );
}
