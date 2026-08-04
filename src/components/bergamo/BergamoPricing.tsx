import { Check } from "lucide-react";

import { BERGAMO_PROMPTS } from "@/data/bergamo";
import { cn } from "@/lib/utils";

export interface BergamoPlan {
  name: string;
  price: string;
  caption: string;
  features: string[];
  highlight?: boolean;
  checkoutUrl: string;
}

const PLANS: BergamoPlan[] = [
  {
    name: "Acervo Completo",
    price: "R$ 27",
    caption: "Pagamento único · acesso vitalício",
    highlight: true,
    features: [
      `Todos os ${BERGAMO_PROMPTS.length} prompts do acervo`,
      "Imagens de referência de cada cena",
      "Guia de foto de referência",
      "Módulo anti-cara-de-IA completo",
      "Playbook de publicação e carrosséis",
      "Prompts de vídeo e motion control",
      "Atualizações vitalícias do acervo",
    ],
    checkoutUrl: "#",
  },
];

/** Planos lado a lado, com destaque no completo. */
export function BergamoPricing() {
  return (
    <section id="planos" className="bergamo-glow relative">
      <div className="mx-auto w-full max-w-5xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
            Escolha seu acesso
          </p>
          <h2 className="mt-3 font-display text-[1.65rem] leading-tight tracking-tight text-balance text-foreground sm:text-4xl">
            Um ensaio fotográfico custa mais que isso. Esse acervo gera infinitos.
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-6">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-3xl border bg-card p-7",
                plan.highlight ? "border-primary/70 shadow-2xl shadow-primary/5" : "border-border/70",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-primary-foreground uppercase">
                  Mais escolhido
                </span>
              )}

              <h3 className="font-display text-2xl tracking-tight text-foreground">{plan.name}</h3>
              <p className="mt-4 font-display text-5xl tracking-tight text-foreground">
                {plan.price}
              </p>
              <p className="mt-1.5 text-xs tracking-wide text-muted-foreground">{plan.caption}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href={plan.checkoutUrl}
                className={cn(
                  "mt-8 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  plan.highlight
                    ? "bergamo-cta"
                    : "border border-border text-foreground",
                )}
              >
                Garantir acesso
              </a>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Compra segura · Acesso imediato por e-mail · 7 dias de garantia incondicional
        </p>
      </div>
    </section>
  );
}