import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { ArsenalLogo } from "@/components/brand/ArsenalLogo";
import { useSession } from "@/hooks/useAuth";
import { memberGetMyAccessFn } from "@/lib/member.functions";

export const Route = createFileRoute("/membros/")({
  head: () => ({
    meta: [{ title: "Meus produtos — Membros" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: MembersPage,
});

function MembersPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const getMyAccess = useServerFn(memberGetMyAccessFn);

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["member", "my-access"],
    queryFn: () => getMyAccess(),
    enabled: Boolean(session),
  });

  if (loading || (session && isLoading)) {
    return <CenteredNote title="Carregando..." />;
  }
  if (!session) {
    return <CenteredNote title="Redirecionando para o login..." />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          to="/bergamo"
          className="mb-10 inline-block rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArsenalLogo className="w-36" />
        </Link>
        <h1 className="text-3xl font-semibold">Meus produtos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Produtos aos quais você tem acesso ativo.
        </p>

        {(!products || products.length === 0) && (
          <p className="mt-10 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Você ainda não tem acesso a nenhum produto.
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {products?.map((product) =>
            product.slug === "bergamo" ? (
              <Link
                key={product.productId}
                to="/membros/bergamo"
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <h2 className="text-lg font-semibold text-foreground">{product.name}</h2>
                {product.tagline && (
                  <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
                )}
                <span className="mt-4 inline-block text-xs font-medium text-primary">
                  Acessar acervo →
                </span>
              </Link>
            ) : (
              <div
                key={product.productId}
                className="rounded-2xl border border-border bg-card p-6 opacity-70"
              >
                <h2 className="text-lg font-semibold text-foreground">{product.name}</h2>
                {product.tagline && (
                  <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
                )}
                <span className="mt-4 inline-block text-xs text-muted-foreground">
                  Área de membros em breve
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function CenteredNote({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <ArsenalLogo className="mx-auto mb-6 w-36" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    </div>
  );
}
