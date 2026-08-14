import { useState } from "react";

import type { MemberRecommendedOffer } from "@/lib/member.server";
import { OfferDetailModal } from "./OfferDetailModal";
import { RecommendedOfferCard } from "./RecommendedOfferCard";

export interface RecommendedOffersRowProps {
  offers: MemberRecommendedOffer[];
}

/** Vitrine de ofertas recomendadas — nada renderiza se não houver nenhuma oferta válida. */
export function RecommendedOffersRow({ offers }: RecommendedOffersRowProps) {
  const [selectedOffer, setSelectedOffer] = useState<MemberRecommendedOffer | null>(null);

  if (offers.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-5 sm:py-14">
      <p className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
        Produtos recomendados
      </p>
      <h2 className="mt-2 font-display text-xl tracking-tight text-foreground sm:text-2xl">
        Outras coisas que podem te interessar
      </h2>
      <div className="mt-6 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5 [scrollbar-width:thin]">
        {offers.map((offer) => (
          <RecommendedOfferCard key={offer.id} offer={offer} onSelect={setSelectedOffer} />
        ))}
      </div>

      <OfferDetailModal
        offer={selectedOffer}
        onOpenChange={(open) => {
          if (!open) setSelectedOffer(null);
        }}
      />
    </section>
  );
}
