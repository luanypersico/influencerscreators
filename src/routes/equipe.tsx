import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthExperienceShell } from "@/components/auth/AuthExperienceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "@/hooks/useAuth";
import { usePostAuthDestination } from "@/hooks/usePostAuthDestination";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Acesso operacional — Bergamo Creators" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TeamAuthPage,
});

function TeamAuthPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const getPostAuthDestination = usePostAuthDestination();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !session) return;
    let active = true;
    getPostAuthDestination()
      .then((destination) => {
        if (active) void router.navigate({ to: destination });
      })
      .catch(() => {
        if (active) toast.error("Não foi possível concluir o login.");
      });
    return () => {
      active = false;
    };
  }, [getPostAuthDestination, loading, router, session]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);

    try {
      if (recovering) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/set-password`,
        });
        if (error) throw error;
        toast.success("Se o e-mail estiver cadastrado, o link será enviado.");
        setRecovering(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast.success("Login realizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthExperienceShell
      badge="Ambiente operacional"
      contextLabel="Acesso da equipe"
      title="Gestão segura do produto Bergamo."
      description="Entrada reservada para proprietários, administradores e coprodutores autorizados. As permissões são validadas no servidor após o login."
      highlights={[
        "Administração e operação em ambientes separados",
        "Autorização real verificada após cada login",
      ]}
    >
      <Toaster />
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
          <KeyRound className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
            Acesso restrito
          </p>
          <h1 className="mt-1 font-display text-xl leading-none text-white sm:text-2xl">
            {recovering ? "Recuperar senha" : "Entrar na operação"}
          </h1>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-white/60">
        {recovering
          ? "Informe o e-mail operacional para receber um link seguro de recuperação."
          : "Use suas credenciais operacionais. O destino será definido pelas permissões reais da conta."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-email" className="text-white/80">
            E-mail operacional
          </Label>
          <Input
            id="team-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-xl border-white/15 bg-black/25 px-4 text-white focus-visible:border-primary"
          />
        </div>

        {!recovering && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="team-password" className="text-white/80">
                Senha
              </Label>
              <button
                type="button"
                onClick={() => setRecovering(true)}
                className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="relative">
              <Input
                id="team-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
        )}

        <Button
          type="submit"
          className="bergamo-cta h-12 w-full rounded-xl border-0 font-bold text-white"
          disabled={busy}
        >
          {busy ? "Aguarde..." : recovering ? "Enviar recuperação" : "Entrar"}
          {!busy && <ArrowRight className="ml-2 size-4" aria-hidden="true" />}
        </Button>
      </form>

      {recovering && (
        <button
          type="button"
          onClick={() => setRecovering(false)}
          className="mt-5 w-full text-xs font-semibold text-white/50 hover:text-white"
        >
          Voltar para o login
        </button>
      )}
    </AuthExperienceShell>
  );
}
