import { LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { ArsenalLogo } from "@/components/brand/ArsenalLogo";
import { useLogout } from "@/hooks/useLogout";
import { memberGetMyAccessFn, memberGetRecommendedOffersFn } from "@/lib/member.functions";
import { MemberHero } from "./MemberHero";
import { OwnedProductCard } from "./OwnedProductCard";
import { RecommendedOffersRow } from "./RecommendedOffersRow";

export interface MemberHomeProps {
  userEmail: string;
}

/**
 * Hub premium do aluno em /membros. Ordem fixa e intencional: 1) o que o
 * aluno já possui (hero + continuar), 2) meus produtos, 3) só depois
 * recomendações — nunca uma página de vendas agressiva.
 */
export function MemberHome({ userEmail }: MemberHomeProps) {
  const { logout, isSigningOut } = useLogout();
  const getMyAccess = useServerFn(memberGetMyAccessFn);
  const getRecommended = useServerFn(memberGetRecommendedOffersFn);

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["member", "my-access"],
    queryFn: () => getMyAccess(),
  });

  const { data: offers } = useQuery({
    queryKey: ["member", "recommended-offers"],
    queryFn: () => getRecommended(),
  });

  const displayName = userEmail.split("@")[0] || "";
  const featured = products?.[0] ?? null;
  const hasAnyProduct = Boolean(products && products.length > 0);

  return (
    <div className="bergamo-theme min-h-screen bg-background font-sans text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-5">
          <Link to="/prompts" aria-label="Arsenal de Prompts — voltar ao topo">
            <ArsenalLogo className="w-[92px] sm:w-[118px]" />
          </Link>
          <button
            type="button"
            disabled={isSigningOut}
            onClick={() => void logout()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase transition-colors hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-4 sm:text-xs"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            {isSigningOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </header>

      <main>
        {!loadingProducts && featured && <MemberHero product={featured} displayName={displayName} />}

        <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-5 sm:py-14">
          <p className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
            Sua área
          </p>
          <h2 className="mt-2 font-display text-xl tracking-tight text-foreground sm:text-2xl">
            Meus produtos
          </h2>

          {loadingProducts ? (
            <p className="mt-8 text-sm text-muted-foreground">Carregando...</p>
          ) : hasAnyProduct ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(products ?? []).map((product) => (
                <OwnedProductCard key={product.productId} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-border/70 bg-card p-8 text-center sm:p-12">
              <p className="font-display text-lg text-foreground">
                Você ainda não tem nenhum produto por aqui.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Assim que um acesso for liberado para sua conta, ele aparece automaticamente
                nesta área.
              </p>
            </div>
          )}
        </section>

        <RecommendedOffersRow offers={offers ?? []} />
      </main>
    </div>
  );
}
