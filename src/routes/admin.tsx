import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useRoles, useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Visão geral", exact: true },
  { to: "/admin/produtos", label: "Produtos" },
  { to: "/admin/bergamo", label: "Bergamo" },
  { to: "/admin/usuarios", label: "Usuários & acessos" },
  { to: "/admin/bergamo-usuarios", label: "Usuários do Bergamo", superAdminOnly: true },
  { to: "/admin/pedidos", label: "Vendas & pedidos" },
  { to: "/admin/emails", label: "E-mails" },
  { to: "/admin/integracoes", label: "Integrações" },
  { to: "/admin/auditoria", label: "Auditoria" },
  { to: "/admin/configuracoes", label: "Configurações" },
] as const;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel de controle — CEO" },
      {
        name: "description",
        content: "Controle total de produtos, usuários, acessos, vendas e e-mails.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Painel de controle — CEO" },
      {
        property: "og:description",
        content: "Controle total de produtos, usuários, acessos, vendas e e-mails.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const { session, user, loading } = useSession();
  const { isAdmin, isSuperAdmin, loading: rolesLoading } = useRoles(user?.id);

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  if (loading || (session && rolesLoading)) {
    return <CenteredNote title="Carregando painel..." />;
  }

  if (!session) return <CenteredNote title="Redirecionando para o login..." />;

  if (!isAdmin) {
    return (
      <CenteredNote
        title="Acesso restrito"
        description="Sua conta não tem permissão administrativa."
        action={
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              router.navigate({ to: "/auth" });
            }}
          >
            Sair
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-border bg-card/60 lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between p-5">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Painel de controle</p>
              <p className="truncate text-xs text-muted-foreground">
                {isSuperAdmin ? "Super admin" : "Admin"} · {user?.email}
              </p>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
            {NAV.filter((item) => !("superAdminOnly" in item) || isSuperAdmin).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: Boolean((item as { exact?: boolean }).exact) }}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                )}
                activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={async () => {
                await supabase.auth.signOut();
                router.navigate({ to: "/auth" });
              }}
            >
              Sair da conta
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function CenteredNote({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
