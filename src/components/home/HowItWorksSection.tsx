import { SectionTitle } from "@/components/site/SectionTitle";

const STEPS = [
  {
    title: "Escolha",
    body: "Conheça as personagens da Casa e encontre a identidade que combina com o seu projeto.",
  },
  {
    title: "Adquira com exclusividade",
    body: "Cada personagem é vendida uma única vez. Depois da compra, ela sai do catálogo.",
  },
  {
    title: "Comece a criar",
    body: "A influencer passa para sua conta, com acesso futuro ao estúdio de conteúdo.",
  },
];

export interface HowItWorksSectionProps {
  bordered?: boolean;
}

export function HowItWorksSection({ bordered = true }: HowItWorksSectionProps) {
  return (
    <section
      className={bordered ? "border-t border-border px-6 py-20 md:px-10" : "px-6 py-20 md:px-10"}
    >
      <div className="mx-auto max-w-6xl">
        <SectionTitle kicker="Como funciona" title="Escolha, adquira e comece a criar" />

        <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="font-mono text-xs text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-xl leading-tight">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
          Você não está comprando um arquivo. Está adquirindo uma identidade digital, uma personagem
          exclusiva e um universo pronto para gerar conteúdo com ela.
        </p>
      </div>
    </section>
  );
}
