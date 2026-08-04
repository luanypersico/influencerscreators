import { BookOpen, Camera, Layers, Wand2 } from "lucide-react";

const BONUSES = [
  {
    icon: Camera,
    title: "Guia de foto de referência",
    description:
      "Como fotografar seu rosto (luz, ângulo, distância) para o gerador travar sua identidade em todas as cenas.",
  },
  {
    icon: Wand2,
    title: "Módulo anti-cara-de-IA",
    description:
      "Blocos prontos de textura de pele, poros, assimetria e imperfeições para colar no fim de qualquer prompt.",
  },
  {
    icon: Layers,
    title: "Estrutura editável",
    description:
      "Cada prompt vem separado em cena, roupa, câmera, luz e negative prompt — troque só o pedaço que quiser.",
  },
  {
    icon: BookOpen,
    title: "Playbook de publicação",
    description:
      "Como transformar as imagens em carrossel de autoridade, capa de vídeo e foto de perfil profissional.",
  },
] as const;

/** Bônus inclusos — cards em grade, sem depoimentos. */
export function BergamoBonus() {
  return (
    <section id="bonus" className="border-y border-border/60 bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
            Incluso no acesso
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
            Não é só uma lista de prompts. É o método inteiro.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {BONUSES.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-3xl border border-border/70 bg-background/60 p-6 transition-colors hover:border-primary/40"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-xl tracking-tight text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}