import { SiteButton } from "@/components/site/SiteButton";
import type { InfluencerStatus } from "@/features/influencers/types";

export interface AcquisitionCtaProps {
  name: string;
  status: InfluencerStatus;
  priceLabel: string;
}

/**
 * Conceptual acquisition CTA — there is no checkout yet, so "buying" routes
 * to /como-funciona (which explains the exclusivity model) instead of a dead
 * button or a fake purchase flow.
 */
export function AcquisitionCta({ name, status, priceLabel }: AcquisitionCtaProps) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      {status === "available" && (
        <>
          <SiteButton to="/como-funciona">Quero a {name}</SiteButton>
          <span className="text-sm text-muted-foreground">{priceLabel}</span>
        </>
      )}
      {status === "reserved" && <SiteButton variant="outline">Reservada no momento</SiteButton>}
      {status === "sold" && (
        <SiteButton to="/influencers" variant="outline">
          Ver outras influencers
        </SiteButton>
      )}
      {status === "coming_soon" && <SiteButton variant="outline">Em breve</SiteButton>}
      <a
        href="#quem-e-ela"
        className="rounded-full px-3.5 py-2.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Ver o universo dela
      </a>
    </div>
  );
}
