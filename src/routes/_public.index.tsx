import { createFileRoute } from "@tanstack/react-router";

import { ContentPossibilitiesSection } from "@/components/home/ContentPossibilitiesSection";
import { FeaturedInfluencersSection } from "@/components/home/FeaturedInfluencersSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { MoreThanAFaceSection } from "@/components/home/MoreThanAFaceSection";
import { SoldExclusivitySection } from "@/components/home/SoldExclusivitySection";
import { getFeaturedInfluencers } from "@/features/influencers/data/publicInfluencers";
import { getRequestHostnameFn, isArsenalHostname } from "@/lib/hostname.functions";

import { BergamoPromptsExperience } from "./prompts";

export const Route = createFileRoute("/_public/")({
  loader: () => getRequestHostnameFn(),
  component: Home,
});

function Home() {
  const hostname = Route.useLoaderData();
  if (isArsenalHostname(hostname)) return <BergamoPromptsExperience />;

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
