import { createFileRoute, Outlet, useMatchRoute, useRouter } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthExperienceShell } from "@/components/auth/AuthExperienceShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { usePostAuthDestination } from "@/hooks/usePostAuthDestination";
import { useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Área do aluno — Bergamo Creators" },
      {
        name: "description",
        content: "Ative ou acesse com segurança o seu Arsenal de Prompts Bergamo.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Área do aluno — Bergamo Creators" },
      {
        property: "og:description",
        content: "Ative ou acesse com segurança o seu Arsenal de Prompts Bergamo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthRoute,
});

const ACCESS_EMAIL_COOLDOWN_SECONDS = 30;
type BuyerAuthMode = "first-access" | "login" | "reset";

/** Renders child auth flows without exposing the login form underneath them. */
function AuthRoute() {
  const matchRoute = useMatchRoute();
  const isSetPasswordRoute = matchRoute({ to: "/auth/set-password", fuzzy: false });
  const isCallbackRoute = matchRoute({ to: "/auth/callback", fuzzy: false });

  if (isSetPasswordRoute || isCallbackRoute) return <Outlet />;
  return <BuyerAuthPage />;
}

function BuyerAuthPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const getPostAuthDestination = usePostAuthDestination();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<BuyerAuthMode>("first-access");
  const [accessEmailSent, setAccessEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (loading || !session) return;
    let active = true;
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
    const timer = setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function changeMode(nextMode: BuyerAuthMode) {
    setMode(nextMode);
    setAccessEmailSent(false);
    setPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || (mode !== "login" && cooldown > 0)) return;
    setBusy(true);

    try {
      if (mode !== "login") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/set-password`,
        });
        if (error) throw error;
        setAccessEmailSent(true);
        setCooldown(ACCESS_EMAIL_COOLDOWN_SECONDS);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      toast.success("Acesso liberado. Bem-vindo de volta.");
    } catch (error) {
      if (mode !== "login") {
        toast.error("Não foi possível enviar o link agora. Tente novamente em instantes.");
      } else {
        toast.error(error instanceof Error ? error.message : "Não foi possível entrar.");
      }
    } finally {
      setBusy(false);
    }
  }

  const isFirstAccess = mode === "first-access";
  const isLogin = mode === "login";

  return (
    <AuthExperienceShell
      badge="Seu acesso começa aqui"
      title="Seu arsenal já está esperando por você."
      description="O acesso é vinculado ao e-mail informado na compra. Ative sua conta uma única vez, crie sua senha e volte quando quiser para usar os 90 prompts completos."
      highlights={[
        "90 prompts profissionais liberados após a validação",
        "Use exatamente o mesmo e-mail informado no checkout",
        "Depois da ativação, seu acesso será por e-mail e senha",
        "Compra e permissão verificadas com segurança no servidor",
      ]}
    >
      <Toaster />
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
          {isLogin ? <KeyRound className="size-5" /> : <ShieldCheck className="size-5" />}
        </span>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
            Área do aluno
          </p>
          <h2 className="mt-1 font-display text-xl leading-none tracking-tight text-white sm:text-2xl">
            {isFirstAccess && "Ativar meu acesso"}
            {isLogin && "Entrar no acervo"}
            {mode === "reset" && "Recuperar minha senha"}
          </h2>
        </div>
      </div>

      {mode !== "reset" && (
        <div className="mt-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/25 p-1">
          <ModeButton active={isFirstAccess} onClick={() => changeMode("first-access")}>
            Primeiro acesso
          </ModeButton>
          <ModeButton active={isLogin} onClick={() => changeMode("login")}>
            Já tenho senha
          </ModeButton>
        </div>
      )}

      <p className="mt-5 text-sm leading-relaxed text-white/65">
        {isFirstAccess && (
          <>
            Informe o <strong className="font-semibold text-white">e-mail usado na compra</strong>.
            Você receberá um link seguro para confirmar sua identidade e criar sua senha.
          </>
        )}
        {isLogin && "Entre com o e-mail da compra e a senha que você criou na ativação."}
        {mode === "reset" &&
          "Enviaremos um link seguro para você criar uma nova senha e recuperar seu acesso."}
      </p>

      {mode !== "login" && accessEmailSent ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5">
            <Mail className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg text-white">Agora confira seu e-mail</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Se esse e-mail estiver associado a uma compra, o link chegará em instantes. Confira
              também as abas Promoções e Spam.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            disabled={cooldown > 0}
            onClick={() => setAccessEmailSent(false)}
          >
            {cooldown > 0 ? `Aguarde ${cooldown}s para tentar novamente` : "Usar outro e-mail"}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyer-email" className="text-sm text-white/80">
              E-mail {isFirstAccess ? "da compra" : "de acesso"}
            </Label>
            <Input
              id="buyer-email"
              type="email"
              autoComplete="email"
              required
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-xl border-white/15 bg-black/25 px-4 text-base text-white placeholder:text-white/30 focus-visible:border-primary"
            />
          </div>

          {isLogin && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="buyer-password" className="text-sm text-white/80">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={() => changeMode("reset")}
                  className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Input
                  id="buyer-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 rounded-xl border-white/15 bg-black/25 pr-12 pl-4 text-base text-white focus-visible:border-primary"
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
            className="bergamo-cta h-12 w-full rounded-xl border-0 text-sm font-bold text-white shadow-[0_14px_40px_-16px_color-mix(in_oklab,var(--primary)_80%,transparent)] transition-transform hover:-translate-y-0.5"
            disabled={busy || (mode !== "login" && cooldown > 0)}
          >
            {busy ? (
              "Aguarde..."
            ) : (
              <>
                {isFirstAccess && "Receber link e criar senha"}
                {isLogin && "Entrar e acessar os prompts"}
                {mode === "reset" && "Enviar link de recuperação"}
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>
      )}

      {mode === "reset" && (
        <button
          type="button"
          onClick={() => changeMode("login")}
          className="mt-5 w-full text-center text-xs font-semibold text-white/55 underline-offset-4 hover:text-white hover:underline"
        >
          Voltar para entrar com senha
        </button>
      )}

      <p className="mt-6 border-t border-white/10 pt-5 text-center text-[11px] leading-relaxed text-white/45">
        O link não cria acesso para e-mails desconhecidos. Sua compra e sua permissão precisam estar
        registradas para o conteúdo ser liberado.
      </p>
    </AuthExperienceShell>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-2.5 text-xs font-bold transition-colors sm:text-sm",
        active
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-white/50 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
