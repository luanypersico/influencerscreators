import type { MemberRecommendedOffer } from "@/lib/member.server";

export interface RecommendedOfferCardProps {
  offer: MemberRecommendedOffer;
  onSelect: (offer: MemberRecommendedOffer) => void;
}

/**
 * Card fechado da oferta recomendada: só a capa. Nome, descrição, vídeo e
 * CTA só existem depois de clicar, dentro de OfferDetailModal — a capa é
 * o elemento de desejo, sem texto nem gradiente cobrindo a arte.
 *
 * Proporção fixa do card: 8:5 (capa recomendada: 1600×1000px).
 */
export function RecommendedOfferCard({ offer, onSelect }: RecommendedOfferCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(offer)}
      aria-label={`Ver detalhes de ${offer.title}`}
      className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--primary)_55%,transparent)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-80"
    >
      <div className="relative aspect-[8/5] overflow-hidden">
        {offer.coverUrl ? (
          <img
            src={offer.coverUrl}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full"
            style={{ backgroundImage: "var(--gradient-bergamo)", opacity: 0.35 }}
          />
        )}
      </div>
    </button>
  );
}
