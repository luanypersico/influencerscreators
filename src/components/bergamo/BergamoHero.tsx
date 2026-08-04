import { ArrowRight, Sparkles } from "lucide-react";

import { BERGAMO_PROMPTS } from "@/data/bergamo";

const HERO_IDS = ["01", "04", "26", "40", "71", "13"] as const;

/** Hero editorial: promessa + mosaico com imagens reais do acervo. */
export function BergamoHero() {
  const showcase = HERO_IDS.map((id) => BERGAMO_PROMPTS.find((p) => p.id === id)).filter(
    (p): p is (typeof BERGAMO_PROMPTS)[number] => Boolean(p),
  );

  return (
    <section id="topo" className="bergamo-glow relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {BERGAMO_PROMPTS.length} prompts profissionais
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            O arsenal de prompts que transforma <em className="text-primary">uma selfie</em> em
            ensaio de autoridade.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Cada prompt do acervo Bergamo foi escrito, testado e refinado para preservar 100% do seu
            rosto e entregar imagem de revista: luz, lente, textura de pele e enquadramento já
            definidos. Você só cola e gera.
          </p>

          <ul className="mt-7 grid gap-2.5 text-sm text-foreground/90 sm:grid-cols-2">
            {[
              "Identidade travada — sem rosto de IA",
              "Lente, diafragma e luz especificados",
              "12 universos: executivo a games",
              "Funciona em qualquer gerador de imagem",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#planos"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Liberar meu acesso
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#acervo"
              className="inline-flex items-center rounded-full border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              Ver o acervo completo
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {showcase.map((item, index) => (
            <figure
              key={item.id}
              className={
                index === 0
                  ? "bergamo-vignette relative col-span-2 aspect-[16/11] overflow-hidden rounded-3xl border border-border/70"
                  : "bergamo-vignette relative aspect-[3/4] overflow-hidden rounded-2xl border border-border/70"
              }
            >
              <img
                src={item.image}
                alt={`Resultado gerado com o prompt ${item.title}`}
                loading={index === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
              <figcaption className="absolute bottom-3 left-3 z-10 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-medium tracking-wide text-foreground/90 uppercase backdrop-blur">
                {item.category}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}