import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

import type { MyProductAccessRow } from "@/lib/member.server";

export interface MemberHeroProps {
  product: MyProductAccessRow;
  displayName: string;
}

/** "Continue acessando" — banner de destaque do produto interno principal do aluno. Só o Arsenal tem destino hoje. */
export function MemberHero({ product, displayName }: MemberHeroProps) {
  const isBergamo = product.slug === "bergamo";

  return (
    <section className="bergamo-glow relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />
      <div className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: "var(--gradient-bergamo)", opacity: 0.16 }} />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
          <p className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
            Bem-vindo de volta{displayName ? `, ${displayName}` : ""}
          </p>
          <h1 className="mt-3 max-w-xl font-display text-[2rem] leading-[1.05] tracking-tight text-balance text-foreground sm:text-5xl">
            {product.name}
          </h1>
          {product.tagline && (
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
              {product.tagline}
            </p>
          )}
          <div className="mt-8">
            {isBergamo ? (
              <Link
                to="/prompts"
                className="bergamo-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold shadow-[0_10px_40px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Continuar acessando
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium text-muted-foreground">
                Área de membros em breve
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
