import { ArrowRight } from "lucide-react";

import type { MemberRecommendedOffer } from "@/lib/member.server";

export interface RecommendedOfferCardProps {
  offer: MemberRecommendedOffer;
  onSelect: (offer: MemberRecommendedOffer) => void;
}

/**
 * Card de uma oferta recomendada (afiliada). Clicar SEMPRE abre o detalhe
 * premium (vídeo + CTA) — nunca vai direto pro checkout. O checkout só
 * existe dentro do modal, em OfferDetailModal.
 */
export function RecommendedOfferCard({ offer, onSelect }: RecommendedOfferCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(offer)}
      className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-3xl border border-border/70 bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-80"
    >
      {/* Capa padrão do admin: 1600×1000px (proporção 8:5 / 16:10) — o card
          segue essa proporção para nunca cortar a imagem enviada. */}
      <div className="bergamo-vignette relative aspect-[8/5] overflow-hidden bg-secondary">
        {offer.coverUrl ? (
          <img
            src={offer.coverUrl}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full"
            style={{ backgroundImage: "var(--gradient-bergamo)", opacity: 0.35 }}
          />
        )}
        {offer.badge && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-primary uppercase backdrop-blur">
            {offer.badge}
          </span>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pt-12 pb-4">
          <h3 className="font-display text-base leading-snug text-white">{offer.title}</h3>
          {offer.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70">
              {offer.description}
            </p>
          )}
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white">
            Conhecer
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </button>
  );
}
