import { createFileRoute } from "@tanstack/react-router";

import { Container } from "@/components/site/Container";
import { SectionTitle } from "@/components/site/SectionTitle";
import { SiteButton } from "@/components/site/SiteButton";
import { AcquisitionCta } from "@/features/influencers/components/AcquisitionCta";
import { ContentShowcaseTabs } from "@/features/influencers/components/ContentShowcaseTabs";
import { DemoCreationTeaser } from "@/features/influencers/components/DemoCreationTeaser";
import { InfluencerNotFound } from "@/features/influencers/components/InfluencerNotFound";
import { PersonalitySection } from "@/features/influencers/components/PersonalitySection";
import { PlaceholderArt } from "@/features/influencers/components/PlaceholderArt";
import { RoutineTimeline } from "@/features/influencers/components/RoutineTimeline";
import { StatusChip } from "@/features/influencers/components/StatusChip";
import { WhatIsIncludedSection } from "@/features/influencers/components/WhatIsIncludedSection";
import { findInfluencerBySlug } from "@/features/influencers/data/publicInfluencers";
import { hasRealPhoto } from "@/features/influencers/types";

export const Route = createFileRoute("/_public/influencers/$slug")({
  head: ({ params }) => {
    const influencer = findInfluencerBySlug(params.slug);
    const title = influencer
      ? `${influencer.name} — A Casa do Influencer AI`
      : "Personagem não encontrada — A Casa do Influencer AI";
    const description =
      influencer?.tagline ??
      "Essa personagem não foi encontrada no catálogo da Casa do Influencer AI.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: InfluencerProfile,
});

function InfluencerProfile() {
  const { slug } = Route.useParams();
  const influencer = findInfluencerBySlug(slug);

  if (!influencer) {
    return <InfluencerNotFound />;
  }

  const revealed = hasRealPhoto(influencer);

  return (
    <div className="pb-20">
      {/* Primeira dobra */}
      <section className="border-b border-border px-6 py-12 md:px-10 md:py-16">
        <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grain overflow-hidden rounded-3xl border border-border">
            {revealed ? (
              <img
                src={influencer.coverImage}
                alt={`${influencer.name} — ${influencer.tagline}`}
                width={1024}
                height={1280}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <PlaceholderArt
                variant={influencer.placeholderVariant}
                initial={influencer.name[0] ?? "?"}
                className="aspect-[4/5] w-full"
              />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip status={influencer.status} demo={influencer.demo} />
              <span className="text-xs tracking-wide text-muted-foreground uppercase">
                {influencer.niches.join(" · ")}
              </span>
            </div>
            <h1 className="mt-3 text-5xl md:text-6xl">{influencer.name}</h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">{influencer.publicBio}</p>
            <div className="mt-8">
              <AcquisitionCta
                name={influencer.name}
                status={influencer.status}
                priceLabel={influencer.publicPriceLabel}
                demo={influencer.demo}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Quem é ela? */}
      <section id="quem-e-ela" className="border-b border-border px-6 py-16 md:px-10">
        <Container>
          <SectionTitle kicker="Personagem" title={`Quem é ${influencer.name}?`} />
          <div className="mt-8">
            <PersonalitySection influencer={influencer} />
          </div>
        </Container>
      </section>

      {/* Um dia na vida dela */}
      <section className="border-b border-border px-6 py-16 md:px-10">
        <Container>
          <SectionTitle kicker="Rotina" title={`Um dia na vida de ${influencer.name}`} />
          <div className="mt-10">
            <RoutineTimeline moments={influencer.routineMoments} name={influencer.name} />
          </div>
        </Container>
      </section>

      {/* Pilares de conteúdo */}
      <section className="border-b border-border px-6 py-16 md:px-10">
        <Container>
          <SectionTitle kicker="Conteúdo" title="Pilares de conteúdo" />
          <div className="mt-6 flex flex-wrap gap-2.5">
            {influencer.contentPillars.map((pillar) => (
              <span
                key={pillar}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground"
              >
                {pillar}
              </span>
            ))}
          </div>

          <div className="mt-10">
            <ContentShowcaseTabs sampleContent={influencer.sampleContent} name={influencer.name} />
          </div>
        </Container>
      </section>

      {/* O que acompanha */}
      <section className="border-b border-border px-6 py-16 md:px-10">
        <Container>
          <SectionTitle kicker="A aquisição" title={`O que acompanha ${influencer.name}?`} />
          <div className="mt-8">
            <WhatIsIncludedSection items={influencer.whatIsIncluded} />
          </div>
        </Container>
      </section>

      {/* Demo do estúdio */}
      <section className="border-b border-border px-6 py-16 md:px-10">
        <Container>
          <SectionTitle kicker="Prévia" title={`O que ${influencer.name} pode criar hoje?`} />
          <div className="mt-8">
            <DemoCreationTeaser name={influencer.name} sampleContent={influencer.sampleContent} />
          </div>
        </Container>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 md:px-10">
        <Container className="flex flex-col items-start gap-6 rounded-3xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="text-3xl md:text-4xl">
              Pronto para colocar {influencer.name} para trabalhar?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Entenda como funciona a exclusividade e o próximo passo.
            </p>
          </div>
          <SiteButton to="/como-funciona" className="shrink-0">
            Como funciona
          </SiteButton>
        </Container>
      </section>
    </div>
  );
}
