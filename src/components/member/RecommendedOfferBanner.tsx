import type { MemberRecommendedOffer } from "@/lib/member.server";

export interface RecommendedOfferBannerProps {
  offers: MemberRecommendedOffer[];
  onSelect: (offer: MemberRecommendedOffer) => void;
}

/**
 * Banner de destaque de uma oferta específica, entre "Meus produtos" e
 * "Produtos recomendados". Só a imagem — clicar abre o mesmo detalhe
 * premium do card. Nada renderiza se nenhuma oferta tiver banner_url
 * configurado no admin.
 *
 * Proporção fixa: 16:5 (banner recomendado: 1600×500px).
 */
export function RecommendedOfferBanner({ offers, onSelect }: RecommendedOfferBannerProps) {
  const offer = offers.find((o) => o.bannerUrl);
  if (!offer?.bannerUrl) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-5">
      <button
        type="button"
        onClick={() => onSelect(offer)}
        aria-label={`Ver detalhes de ${offer.title}`}
        className="group relative block w-full overflow-hidden rounded-3xl border border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--primary)_55%,transparent)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <div className="aspect-[16/5] w-full overflow-hidden">
          <img
            src={offer.bannerUrl}
            alt={offer.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </button>
    </section>
  );
}
