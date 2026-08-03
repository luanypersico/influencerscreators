import { FaqAccordion } from "@/components/site/FaqAccordion";
import { SectionTitle } from "@/components/site/SectionTitle";
import { SiteButton } from "@/components/site/SiteButton";

const FAQ = [
  {
    question: "O que eu recebo ao adquirir uma influencer?",
    answer:
      "A exclusividade sobre a personagem, seu perfil e identidade, referências visuais, personalidade e linguagem definidas, universo visual, rotina-base e acesso futuro ao estúdio de criação. Os detalhes completos ficam disponíveis antes da confirmação da compra.",
  },
  {
    question: "Outra pessoa pode comprar a mesma influencer depois de mim?",
    answer: "Não. Cada personagem é vendida uma única vez e sai do catálogo assim que é adquirida.",
  },
  {
    question: "Isso é um gerador de imagens de IA?",
    answer:
      "Não. Cada influencer é uma personagem com identidade, personalidade, rotina e universo visual próprios — pensada para produzir conteúdo com continuidade, não imagens aleatórias e desconexas.",
  },
  {
    question: "Quando o estúdio de criação estará disponível?",
    answer:
      "Estamos construindo essa etapa agora. Por enquanto, você pode conhecer o catálogo e entender como o modelo funciona.",
  },
];

export function FinalCtaSection() {
  return (
    <section className="border-t border-border px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-3xl md:text-4xl">Sua próxima influencer está esperando.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore o catálogo e conheça as personagens disponíveis na Casa.
            </p>
          </div>
          <SiteButton to="/influencers" className="shrink-0">
            Conhecer influencers
          </SiteButton>
        </div>

        <div className="mt-16">
          <SectionTitle kicker="Perguntas" title="Perguntas frequentes" />
          <div className="mt-8">
            <FaqAccordion items={FAQ} />
          </div>
        </div>
      </div>
    </section>
  );
}
