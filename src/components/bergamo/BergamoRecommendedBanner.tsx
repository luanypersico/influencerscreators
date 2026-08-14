import type { MemberRecommendedOffer } from "@/lib/member.server";

export interface BergamoRecommendedBannerProps {
  offers: MemberRecommendedOffer[];
  onSelect: (offer: MemberRecommendedOffer) => void;
}

/**
 * Substitui a região comercial (preço/FAQ) para quem já tem acesso ao
 * Arsenal: recomendação complementar, não uma nova página de venda do
 * próprio produto. Reaproveita a mesma member_offer e o mesmo sinal de
 * destaque (bannerUrl) já usados no banner de /membros — os dados
 * continuam 100% administráveis pelo Super Admin, nunca hardcoded aqui.
 * Clique abre o mesmo detalhe premium com vídeo do card de /membros
 * (onSelect, modal compartilhado) — não vai direto pro checkout.
 *
 * Sem proporção fixa: a imagem define sua própria altura (w-full h-auto),
 * então nunca é cortada — qualquer banner enviado pelo admin aparece
 * inteiro, em qualquer tela.
 */
export function BergamoRecommendedBanner({ offers, onSelect }: BergamoRecommendedBannerProps) {
  const offer = offers.find((o) => o.bannerUrl && o.checkoutUrl);
  if (!offer?.bannerUrl || !offer.checkoutUrl) return null;

  return (
    <section id="recomendado" className="border-t border-border/60">
      <div className="mx-auto w-full max-w-5xl px-5 py-16 lg:py-24">
        <p className="text-center text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
          Recomendado para você
        </p>
        <button
          type="button"
          onClick={() => onSelect(offer)}
          aria-label={`Ver detalhes de ${offer.title}`}
          className="group mt-6 block w-full overflow-hidden rounded-3xl border border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--primary)_55%,transparent)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <img
            src={offer.bannerUrl}
            alt={offer.title}
            loading="lazy"
            className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </button>
      </div>
    </section>
  );
}
