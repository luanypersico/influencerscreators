import { createFileRoute } from "@tanstack/react-router";

import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { Container } from "@/components/site/Container";
import { SectionTitle } from "@/components/site/SectionTitle";
import { SiteButton } from "@/components/site/SiteButton";

const TITLE = "Como funciona — A Casa";
const DESCRIPTION =
  "Entenda como funciona a exclusividade das influencers virtuais da Casa, da escolha até o futuro estúdio de criação.";

export const Route = createFileRoute("/_public/como-funciona")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ComoFunciona,
});

function ComoFunciona() {
  return (
    <div className="pb-8">
      <section className="px-6 pt-16 pb-4 md:px-10">
        <Container>
          <SectionTitle
            kicker="Como funciona"
            title="Da escolha ao dia a dia da sua influencer"
            subtitle="Um passo a passo claro de como a exclusividade funciona hoje — e do que vem depois."
          />
        </Container>
      </section>

      <HowItWorksSection bordered={false} />

      <section className="border-t border-border px-6 py-16 md:px-10">
        <Container className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-xl">Exclusividade, de verdade</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Cada personagem existe uma única vez no catálogo. Ao ser adquirida, ela sai de
              circulação — mais ninguém pode comprá-la, e ela passa a ser vinculada só à sua conta.
            </p>
          </div>
          <div>
            <h3 className="text-xl">Identidade digital, não apenas imagens</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Comprar uma influencer da Casa não é comprar um pacote de fotos. É adquirir uma
              personagem com nome, personalidade, rotina, universo visual e linguagem próprios — a
              base para gerar conteúdo com continuidade, não peças soltas e desconexas.
            </p>
          </div>
          <div>
            <h3 className="text-xl">"Minhas Influencers"</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Depois da aquisição, a personagem passa a viver na sua conta, em uma área dedicada —
              "Minhas Influencers" — de onde você vai acompanhar e operar cada uma delas.
            </p>
          </div>
          <div>
            <h3 className="text-xl">O futuro estúdio de criação</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos construindo um estúdio privado para produzir conteúdo diariamente com sua
              influencer — Stories, Feed, Reels, UGC e mais — sem precisar reconstruir a personagem
              a cada peça. Essa etapa ainda está em desenvolvimento.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-border px-6 py-16 md:px-10">
        <Container className="flex flex-col items-start gap-6 rounded-3xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-3xl md:text-4xl">Pronto para conhecer as influencers da Casa?</h2>
          </div>
          <SiteButton to="/influencers" className="shrink-0">
            Ver catálogo
          </SiteButton>
        </Container>
      </section>
    </div>
  );
}
