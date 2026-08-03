import { createFileRoute } from "@tanstack/react-router";

import { Container } from "@/components/site/Container";
import { SectionTitle } from "@/components/site/SectionTitle";
import { ContinuitySection } from "@/features/influencer-studio/components/ContinuitySection";
import { CreateTodaySection } from "@/features/influencer-studio/components/CreateTodaySection";
import { LibrarySection } from "@/features/influencer-studio/components/LibrarySection";
import { StudioHeader } from "@/features/influencer-studio/components/StudioHeader";
import { StudioNotFound } from "@/features/influencer-studio/components/StudioNotFound";
import { TodayInHerLifeSection } from "@/features/influencer-studio/components/TodayInHerLifeSection";
import { findStudioRecordBySlug } from "@/features/influencer-studio/data/studioDemoRecords";
import { useTodayContext } from "@/features/influencer-studio/useTodayContext";
import { RoutineTimeline } from "@/features/influencers/components/RoutineTimeline";

export const Route = createFileRoute("/studio-demo/$slug")({
  head: ({ params }) => {
    const record = findStudioRecordBySlug(params.slug);
    const title = record
      ? `Estúdio de ${record.publicProfile.name} (demonstração) — A Casa do Influencer AI`
      : "Estúdio não encontrado — A Casa do Influencer AI";
    const description = record
      ? `Prévia demonstrativa de como seria operar ${record.publicProfile.name} no estúdio da Casa do Influencer AI.`
      : "Essa personagem ainda não tem uma demonstração de estúdio.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: StudioDemoPage,
});

function StudioDemoPage() {
  const { slug } = Route.useParams();
  const record = findStudioRecordBySlug(slug);
  const today = useTodayContext();

  if (!record) {
    return <StudioNotFound />;
  }

  const { publicProfile, operational } = record;

  return (
    <div className="min-h-screen bg-background pb-8">
      <StudioHeader profile={publicProfile} today={today} />

      <TodayInHerLifeSection name={publicProfile.name} operational={operational} today={today} />

      <CreateTodaySection name={publicProfile.name} operational={operational} />

      <section className="border-b border-border px-6 py-16 md:px-10">
        <Container>
          <SectionTitle kicker="Rotina" title={`A rotina de ${publicProfile.name}`} />
          <div className="mt-10">
            <RoutineTimeline moments={operational.routine} name={publicProfile.name} />
          </div>
        </Container>
      </section>

      <ContinuitySection name={publicProfile.name} operational={operational} />

      <LibrarySection name={publicProfile.name} sampleContent={publicProfile.sampleContent} />
    </div>
  );
}
