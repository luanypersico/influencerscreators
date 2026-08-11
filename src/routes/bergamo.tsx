import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Toaster } from "@/components/ui/sonner";
import { BergamoBonus } from "@/components/bergamo/BergamoBonus";
import { BergamoFaq } from "@/components/bergamo/BergamoFaq";
import { BergamoGallery } from "@/components/bergamo/BergamoGallery";
import { BergamoHeader } from "@/components/bergamo/BergamoHeader";
import { BergamoHero } from "@/components/bergamo/BergamoHero";
import { BergamoPricing } from "@/components/bergamo/BergamoPricing";
import { useSession } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import {
  getBergamoAuthenticatedExperienceFn,
  getBergamoOfferFn,
  getBergamoPublicCatalogFn,
  getBergamoPublicHeroFn,
} from "@/lib/bergamo-catalog.functions";

const TITLE = "Bergamo Creators — 90 prompts de retrato realista com IA";
const DESCRIPTION =
  "Acervo com 90 prompts profissionais para transformar uma selfie em ensaio de autoridade: identidade travada, lente, luz e textura de pele já definidos.";

export const Route = createFileRoute("/bergamo")({
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
  component: BergamoPage,
});

/** Página de vendas isolada do produto Bergamo (tema próprio, sem layout do site). */
function BergamoPage() {
  const { session } = useSession();
  const { logout, isSigningOut } = useLogout();
  const getCatalog = useServerFn(getBergamoPublicCatalogFn);
  const getPublicHero = useServerFn(getBergamoPublicHeroFn);
  const getAuthenticatedExperience = useServerFn(getBergamoAuthenticatedExperienceFn);
  const getOffer = useServerFn(getBergamoOfferFn);

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

  return (
    <div className="bergamo-theme min-h-screen bg-background font-sans text-foreground antialiased">
      <BergamoHeader
        ctaHref={checkoutUrl}
        viewer={authenticatedExperience?.viewer ?? null}
        onLogout={logout}
        isSigningOut={isSigningOut}
      />
      <main className="protected-content">
        <BergamoHero items={heroItems} totalCount={totalCount} checkoutUrl={checkoutUrl} />
        <BergamoGallery items={items} categories={categories} checkoutUrl={checkoutUrl} />
        <BergamoBonus />
        <BergamoPricing totalCount={totalCount} checkoutUrl={checkoutUrl} />
        <BergamoFaq />
      </main>
      <p className="print-protected-notice">Conteúdo protegido — impressão desativada</p>
      <Toaster />
    </div>
  );
}
