import { SiteButton } from "@/components/site/SiteButton";
import type { InfluencerStatus } from "@/features/influencers/types";

export interface AcquisitionCtaProps {
  name: string;
  status: InfluencerStatus;
  priceLabel: string;
  /** True for every entry in this round's catalog — see the demo branch below. */
  demo: boolean;
}

const SECONDARY_LINK_CLASS =
  "rounded-full px-3.5 py-2.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground " +
  "hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** A status the visitor can't act on — rendered as plain text, not a button that does nothing when clicked. */
function InactiveStatusNote({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground">
      {children}
    </span>
  );
}

/**
 * Conceptual acquisition CTA — there is no checkout yet, so "buying" routes
 * to /como-funciona (which explains the exclusivity model) instead of a dead
 * button or a fake purchase flow.
 *
 * Demo profiles (every entry this round) never show a price or a "Quero a
 * X" purchase CTA — that would misrepresent real commercial availability.
 * The status-based branch below is kept for when the catalog has real,
 * non-demo, revealed characters.
 */
export function AcquisitionCta({ name, status, priceLabel, demo }: AcquisitionCtaProps) {
  if (demo) {
    return (
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <SiteButton to="/como-funciona">Conhecer a experiência</SiteButton>
        <span className="text-sm text-muted-foreground">
          Perfil demonstrativo — sem oferta comercial real.
        </span>
        <a href="#quem-e-ela" className={SECONDARY_LINK_CLASS}>
          Ver o universo dela
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      {status === "available" && (
        <>
          <SiteButton to="/como-funciona">Quero a {name}</SiteButton>
          <span className="text-sm text-muted-foreground">{priceLabel}</span>
        </>
      )}
      {status === "reserved" && <InactiveStatusNote>Reservada no momento</InactiveStatusNote>}
      {status === "sold" && (
        <SiteButton to="/influencers" variant="outline">
          Ver outras influencers
        </SiteButton>
      )}
      {status === "coming_soon" && <InactiveStatusNote>Em breve</InactiveStatusNote>}
      <a href="#quem-e-ela" className={SECONDARY_LINK_CLASS}>
        Ver o universo dela
      </a>
    </div>
  );
}
