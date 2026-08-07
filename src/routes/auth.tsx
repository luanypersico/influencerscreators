import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { usePostAuthDestination } from "@/hooks/usePostAuthDestination";
import { useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar" },
      { name: "description", content: "Acesso à área de membros e ao painel de controle." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Entrar" },
      { property: "og:description", content: "Acesso à área de membros e ao painel de controle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const MAGIC_LINK_COOLDOWN_SECONDS = 30;

function AuthPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const getPostAuthDestination = usePostAuthDestination();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "reset" | "magic">("magic");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (loading || !session) return;
    let active = true;
    // O servidor resolve um único caminho interno a partir da sessão validada;
    // nunca há destino vindo da URL ou de entrada do navegador.
    getPostAuthDestination()
      .then((destination) => {
        if (active) void router.navigate({ to: destination });
      })
      .catch(() => {
        if (active) toast.error("Não foi possível concluir o login. Tente novamente.");
      });
    return () => {
      active = false;
    };
  }, [getPostAuthDestination, loading, router, session]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/set-password`,
        });
        if (error) throw error;
        toast.success("Se esse e-mail existir, um link de redefinição foi enviado.");
        setMode("login");
        return;
      }

      if (mode === "magic") {
        if (cooldown > 0) return;
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            shouldCreateUser: false,
          },
        });
        if (error) throw error;
        setMagicLinkSent(true);
        setCooldown(MAGIC_LINK_COOLDOWN_SECONDS);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast.success("Bem-vindo de volta.");
    } catch (err) {
      // Mensagem neutra: nunca confirma nem nega se o e-mail existe.
      if (mode === "magic") {
        toast.error("Não foi possível enviar o link agora. Tente novamente em instantes.");
      } else {
        toast.error(err instanceof Error ? err.message : "Não foi possível entrar.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Toaster />
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Acesso
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {mode === "magic" && "Entrar com link mágico"}
          {mode === "login" && "Entrar com senha"}
          {mode === "reset" && "Recuperar acesso"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "magic" &&
            "Informe o e-mail usado na compra. Enviamos um link seguro de acesso."}
          {mode === "login" && "Acesso restrito à equipe."}
          {mode === "reset" && "Enviaremos um link para redefinir sua senha."}
        </p>

        {mode === "magic" && magicLinkSent ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-border bg-secondary/40 p-4 text-sm text-foreground">
              Se esse e-mail estiver associado a uma compra, você vai receber um link de acesso em
              instantes. Confira também a caixa de spam.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={cooldown > 0}
              onClick={() => setMagicLinkSent(false)}
            >
              {cooldown > 0 ? `Aguarde ${cooldown}s para tentar de novo` : "Usar outro e-mail"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode === "login" && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={busy || (mode === "magic" && cooldown > 0)}
            >
              {busy
                ? "Aguarde..."
                : mode === "magic"
                  ? cooldown > 0
                    ? `Aguarde ${cooldown}s`
                    : "Enviar link de acesso"
                  : mode === "login"
                    ? "Entrar"
                    : "Enviar link"}
            </Button>
          </form>
        )}

        <div className="mt-4 flex flex-col items-center gap-2 text-center">
          {mode !== "magic" && (
            <button
              type="button"
              onClick={() => {
                setMode("magic");
                setMagicLinkSent(false);
              }}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Comprei um produto — entrar com link mágico
            </button>
          )}
          {mode !== "login" && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Sou da equipe — entrar com senha
            </button>
          )}
          {mode === "login" && (
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
