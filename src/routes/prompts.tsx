import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Toaster } from "@/components/ui/sonner";
import { BergamoBonus } from "@/components/bergamo/BergamoBonus";
import { BergamoFaq } from "@/components/bergamo/BergamoFaq";
import { BergamoGallery } from "@/components/bergamo/BergamoGallery";
import { BergamoHeader } from "@/components/bergamo/BergamoHeader";
import { BergamoHero } from "@/components/bergamo/BergamoHero";
import { BergamoPricing } from "@/components/bergamo/BergamoPricing";
import { BergamoRecommendedBanner } from "@/components/bergamo/BergamoRecommendedBanner";
import { OfferDetailModal } from "@/components/member/OfferDetailModal";
import { useSession } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { getRequestHostnameFn, isArsenalHostname } from "@/lib/hostname.functions";
import {
  getBergamoAuthenticatedExperienceFn,
  getBergamoOfferFn,
  getBergamoPublicCatalogFn,
  getBergamoPublicHeroFn,
} from "@/lib/bergamo-catalog.functions";
import type { MemberRecommendedOffer } from "@/lib/member.server";
import { memberGetRecommendedOffersFn } from "@/lib/member.functions";

const TITLE = "Bergamo Creators — 90 prompts de retrato realista com IA";
const DESCRIPTION =
  "Acervo com 90 prompts profissionais para transformar uma selfie em ensaio de autoridade: identidade travada, lente, luz e textura de pele já definidos.";

export const Route = createFileRoute("/prompts")({
  beforeLoad: async () => {
    if (!isArsenalHostname(await getRequestHostnameFn()))
      throw redirect({ to: "/", replace: true });
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BergamoPromptsExperience,
});

/** Experiência canônica do Arsenal: pública para visitantes e completa para membros autorizados. */
export function BergamoPromptsExperience() {
  const { session } = useSession();
  const { logout, isSigningOut } = useLogout();
  const getCatalog = useServerFn(getBergamoPublicCatalogFn);
  const getPublicHero = useServerFn(getBergamoPublicHeroFn);
  const getAuthenticatedExperience = useServerFn(getBergamoAuthenticatedExperienceFn);
  const getOffer = useServerFn(getBergamoOfferFn);
  const getRecommendedOffers = useServerFn(memberGetRecommendedOffersFn);

  const { data: publicCatalog } = useQuery({
    queryKey: ["bergamo", "public-catalog"],
    queryFn: () => getCatalog(),
  });

  const { data: publicHero } = useQuery({
    queryKey: ["bergamo", "public-hero"],
    queryFn: () => getPublicHero(),
  });

  const { data: authenticatedExperience } = useQuery({
    queryKey: ["bergamo", "authenticated-experience", session?.user.id],
    queryFn: () => getAuthenticatedExperience(),
    enabled: Boolean(session),
    retry: false,
    refetchInterval: session ? 10 * 60 * 1000 : false,
  });

  const { data: offer } = useQuery({
    queryKey: ["bergamo", "offer"],
    queryFn: () => getOffer(),
  });

  const data = authenticatedExperience?.catalog ?? publicCatalog;

  const items = data?.items ?? [];
  const categories = data?.categories ?? [];
  const totalCount = data?.totalCount ?? 0;
  const checkoutUrl = offer?.checkoutUrl ?? null;
  const heroItems = authenticatedExperience?.catalog?.items ?? publicHero ?? items;
  // Server-decided (has_product_access via getBergamoAuthenticatedExperience) — a
  // session alone never counts as membership, only real, active Bergamo access does.
  const isMember = Boolean(authenticatedExperience?.viewer?.hasFullAccess);

  // Mesma vitrine afiliada (member_offers) já usada em /membros — só buscada
  // para quem já tem acesso, para substituir a região comercial pelo banner.
  const { data: recommendedOffers } = useQuery({
    queryKey: ["bergamo", "recommended-offers"],
    queryFn: () => getRecommendedOffers(),
    enabled: isMember,
  });

  const [selectedOffer, setSelectedOffer] = useState<MemberRecommendedOffer | null>(null);

  return (
    <div className="bergamo-theme min-h-screen bg-background font-sans text-foreground antialiased">
      <BergamoHeader
        ctaHref={checkoutUrl}
        viewer={authenticatedExperience?.viewer ?? null}
        onLogout={logout}
        isSigningOut={isSigningOut}
      />
      <main className="protected-content">
        {!isMember && (
          <BergamoHero items={heroItems} totalCount={totalCount} checkoutUrl={checkoutUrl} />
        )}
        <BergamoGallery items={items} categories={categories} checkoutUrl={checkoutUrl} />
        {!isMember && <BergamoBonus />}
        {!isMember && <BergamoPricing totalCount={totalCount} checkoutUrl={checkoutUrl} />}
        {isMember && (
          <BergamoRecommendedBanner offers={recommendedOffers ?? []} onSelect={setSelectedOffer} />
        )}
        <BergamoFaq hideQuestions={isMember} />
      </main>
      <p className="print-protected-notice">Conteúdo protegido — impressão desativada</p>
      <OfferDetailModal
        offer={selectedOffer}
        onOpenChange={(open) => {
          if (!open) setSelectedOffer(null);
        }}
      />
      <Toaster />
    </div>
  );
}
