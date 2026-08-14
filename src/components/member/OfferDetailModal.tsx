import { ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MemberRecommendedOffer } from "@/lib/member.server";
import { buildYouTubeEmbedUrl } from "@/lib/youtube";

export interface OfferDetailModalProps {
  offer: MemberRecommendedOffer | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Detalhe premium de uma oferta recomendada — vídeo, nome, descrição e o
 * único ponto de saída pro checkout externo. O card nunca vai direto pro
 * checkout; só este CTA aqui dentro leva pra fora do Arsenal.
 */
export function OfferDetailModal({ offer, onOpenChange }: OfferDetailModalProps) {
  const embedUrl = offer?.videoUrl ? buildYouTubeEmbedUrl(offer.videoUrl) : null;

  return (
    <Dialog open={Boolean(offer)} onOpenChange={onOpenChange}>
      {offer && (
        <DialogContent
          className="bergamo-theme max-h-[90vh] w-[95vw] max-w-3xl gap-0 overflow-y-auto rounded-3xl border-primary/25 bg-card p-0 shadow-[0_40px_120px_-20px_color-mix(in_oklab,var(--primary)_35%,transparent)] sm:w-full"
        >
          <div className="relative flex w-full shrink-0 items-center justify-center bg-black">
            {embedUrl ? (
              // Vídeo em formato Shorts (9:16) — centralizado, sem esticar
              // para o formato paisagem do resto do modal.
              <div className="relative aspect-[9/16] h-[52vh] max-h-[620px] overflow-hidden sm:h-[65vh]">
                <iframe
                  src={embedUrl}
                  title={offer.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : offer.coverUrl ? (
              <img
                src={offer.coverUrl}
                alt={offer.title}
                className="aspect-[8/5] w-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="aspect-[8/5] w-full"
                style={{ backgroundImage: "var(--gradient-bergamo)", opacity: 0.35 }}
              />
            )}
          </div>

          <div className="p-6 sm:p-8">
            {offer.badge && (
              <p className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
                {offer.badge}
              </p>
            )}
            <DialogTitle className="mt-2 font-display text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">
              {offer.title}
            </DialogTitle>
            {offer.description && (
              <DialogDescription className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground sm:text-base">
                {offer.description}
              </DialogDescription>
            )}

            <div className="mt-7">
              {offer.checkoutUrl && (
                <a
                  href={offer.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bergamo-cta inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold shadow-[0_10px_40px_-12px_color-mix(in_oklab,var(--primary)_60%,transparent)] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-auto"
                >
                  Comprar agora →
                </a>
              )}
              <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                Após a compra, você receberá o acesso ao curso diretamente na área de membros da
                Hotmart.
              </p>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
