import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

import type { MyProductAccessRow } from "@/lib/member.server";

export interface OwnedProductCardProps {
  product: MyProductAccessRow;
}

/**
 * Card de um produto que o usuário já possui (product_access ativo).
 * Só o Arsenal (slug "bergamo") tem destino hoje — outros produtos
 * internos aparecem como "em breve", sem inventar uma rota que não existe.
 */
export function OwnedProductCard({ product }: OwnedProductCardProps) {
  const isBergamo = product.slug === "bergamo";

  const inner = (
    <>
      <div className="bergamo-vignette relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-secondary via-accent to-primary/40">
        {product.coverUrl ? (
          <img
            src={product.coverUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-90"
              style={{ backgroundImage: "var(--gradient-bergamo)" }}
            />
            <Sparkles
              className="absolute right-5 bottom-5 size-8 text-white/25 transition-transform duration-500 group-hover:scale-110"
              aria-hidden="true"
            />
          </>
        )}
      </div>
      <div className="space-y-2 p-5">
        <h3 className="font-display text-xl tracking-tight text-foreground">{product.name}</h3>
        {product.tagline && (
          <p className="text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
        )}
        <div className="pt-1">
          {isBergamo ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Acessar
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          ) : (
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Área de membros em breve
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cardClass =
    "group overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-300";

  if (isBergamo) {
    return (
      <Link
        to="/prompts"
        className={`${cardClass} block hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--primary)_55%,transparent)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={`${cardClass} opacity-75`}>{inner}</div>;
}
