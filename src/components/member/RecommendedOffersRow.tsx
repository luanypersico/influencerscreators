import type { MemberRecommendedOffer } from "@/lib/member.server";
import { RecommendedOfferCard } from "./RecommendedOfferCard";

export interface RecommendedOffersRowProps {
  offers: MemberRecommendedOffer[];
  onSelect: (offer: MemberRecommendedOffer) => void;
}

/**
 * Vitrine de ofertas recomendadas — nada renderiza se não houver nenhuma
 * oferta válida. O modal de detalhe é compartilhado com o banner de
 * destaque, então vive em MemberHome (estado elevado), não aqui.
 */
export function RecommendedOffersRow({ offers, onSelect }: RecommendedOffersRowProps) {
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
          <RecommendedOfferCard key={offer.id} offer={offer} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
