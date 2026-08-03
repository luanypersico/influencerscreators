import { SectionTitle } from "@/components/site/SectionTitle";
import { SiteButton } from "@/components/site/SiteButton";
import { InfluencerCard } from "@/features/influencers/components/InfluencerCard";
import type { PublicInfluencer } from "@/features/influencers/types";

export interface FeaturedInfluencersSectionProps {
  influencers: PublicInfluencer[];
}

export function FeaturedInfluencersSection({ influencers }: FeaturedInfluencersSectionProps) {
  return (
    <section className="border-t border-border px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            kicker="Catálogo"
            title="Influencers em destaque"
            subtitle="Cada uma com identidade, personalidade e universo visual próprios."
          />
          <SiteButton to="/influencers" variant="outline" className="self-start">
            Ver catálogo completo
          </SiteButton>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {influencers.map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
        </div>
      </div>
    </section>
  );
}
