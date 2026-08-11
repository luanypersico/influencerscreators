import { ArrowRight, Sparkles } from "lucide-react";

import { bergamoImage } from "@/data/bergamoAssets";
import type { BergamoCatalogItem } from "@/lib/bergamo-catalog.server";
import { BERGAMO_PUBLIC_HERO_CODES } from "@/lib/bergamo-public-hero.constants";

export interface BergamoHeroProps {
  items: BergamoCatalogItem[];
  totalCount: number;
  checkoutUrl: string | null;
}

/** Hero editorial: promessa + mosaico com imagens reais do acervo (dados do backend, sem prompt completo no bundle). */
export function BergamoHero({ items, totalCount, checkoutUrl }: BergamoHeroProps) {
  const byCode = new Map(items.map((item) => [item.code, item]));
  const showcase = BERGAMO_PUBLIC_HERO_CODES.map((id) => byCode.get(id)).filter(
    (item): item is BergamoCatalogItem => Boolean(item),
  );

  return (
    <section id="topo" className="bergamo-glow relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-5 sm:py-16 lg:grid-cols-[1.02fr_1fr] lg:gap-16 lg:py-24">
        <div className="min-w-0">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-primary uppercase sm:text-[11px]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {totalCount} prompts profissionais
          </span>

          <h1 className="mt-5 font-display text-[2rem] leading-[1.02] tracking-tight text-balance text-foreground sm:mt-6 sm:text-5xl lg:text-6xl">
            O arsenal de prompts que transforma <em className="text-primary">uma selfie</em> em
            ensaio de autoridade.
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg">
            Cada prompt do acervo Bergamo foi escrito, testado e refinado para preservar 100% do seu
            rosto e entregar imagem de revista: luz, lente, textura de pele e enquadramento já
            definidos. Você só cola e gera.
          </p>

          <ul className="mt-7 grid gap-3 text-sm text-foreground/90 sm:grid-cols-2">
            {[
              "Identidade travada — sem rosto de IA",
              "Lente, diafragma e luz especificados",
              "12 universos: executivo a games",
              "Funciona em qualquer gerador de imagem",
            ].map((item) => (
              <li key={item} className="flex min-w-0 items-start gap-2.5">
                <span
                  className="mt-1 grid size-4 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/15"
                  aria-hidden="true"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                </span>
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {checkoutUrl ? (
              <a
                href={checkoutUrl}
                className="bergamo-cta inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold shadow-[0_10px_40px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Liberar meu acesso
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="bergamo-cta inline-flex cursor-wait items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold opacity-60"
              >
                Liberar meu acesso
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            )}
            <a
              href="#acervo"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              Ver o acervo completo
            </a>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl"
          />
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {[showcase.slice(0, 3), showcase.slice(3, 6)].map((column, columnIndex) => (
              <div
                key={columnIndex}
                className={
                  columnIndex === 1
                    ? "flex flex-col gap-3 pt-6 sm:gap-4 sm:pt-10"
                    : "flex flex-col gap-3 sm:gap-4"
                }
              >
                {column.map((item, index) => (
                  <figure
                    key={item.code}
                    className="bergamo-vignette group relative overflow-hidden rounded-2xl border border-border/70 bg-card transition-transform duration-500 hover:-translate-y-1 sm:rounded-3xl"
                  >
                    <img
                      src={item.imageUrl ?? bergamoImage(item.code)}
                      alt={`Resultado gerado com o prompt ${item.title}`}
                      width={760}
                      height={1018}
                      loading={columnIndex === 0 && index === 0 ? "eager" : "lazy"}
                      className="block h-auto w-full"
                    />
                    <figcaption className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-background/70 px-2.5 py-1 text-[9px] font-medium tracking-wide text-foreground/90 uppercase backdrop-blur sm:bottom-3 sm:left-3 sm:text-[10px]">
                      {item.category}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center sm:mt-5">
            <div className="w-full max-w-[17rem] overflow-hidden rounded-2xl border border-border/70 bg-card p-1.5 shadow-[0_18px_48px_-24px_color-mix(in_oklab,var(--primary)_55%,transparent)] sm:max-w-[19rem] sm:rounded-3xl">
              <div className="relative aspect-[9/16] overflow-hidden rounded-[0.9rem] bg-background sm:rounded-[1.15rem]">
                <iframe
                  className="absolute inset-0 size-full"
                  src="https://www.youtube.com/embed/yvD4mIGoJuM?rel=0"
                  title="Demonstração do Arsenal Bergamo"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
