import { createFileRoute } from "@tanstack/react-router";

import { ContentPossibilitiesSection } from "@/components/home/ContentPossibilitiesSection";
import { FeaturedInfluencersSection } from "@/components/home/FeaturedInfluencersSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { MoreThanAFaceSection } from "@/components/home/MoreThanAFaceSection";
import { SoldExclusivitySection } from "@/components/home/SoldExclusivitySection";
import { getFeaturedInfluencers } from "@/features/influencers/data/publicInfluencers";

const TITLE = "A Casa — influencers virtuais exclusivas";
const DESCRIPTION =
  "Encontre a influencer virtual exclusiva que vai representar sua próxima marca: identidade, personalidade, rotina e universo visual próprios.";

export const Route = createFileRoute("/_public/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = getFeaturedInfluencers();

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      {featured.length > 0 && <FeaturedInfluencersSection influencers={featured} />}
      <MoreThanAFaceSection />
      <ContentPossibilitiesSection />
      <SoldExclusivitySection />
      <FinalCtaSection />
    </>
  );
}
