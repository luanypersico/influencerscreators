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
import { PrivacyCurtain } from "@/components/security/PrivacyCurtain";
import { useRoles, useSession } from "@/hooks/useAuth";
import {
  getBergamoAdminCatalogFn,
  getBergamoOfferFn,
  getBergamoPublicCatalogFn,
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
  const { isAdmin } = useRoles(session?.user.id);
  const getCatalog = useServerFn(getBergamoPublicCatalogFn);
  const getAdminCatalog = useServerFn(getBergamoAdminCatalogFn);
  const getOffer = useServerFn(getBergamoOfferFn);

  const { data: publicCatalog } = useQuery({
    queryKey: ["bergamo", "public-catalog"],
    queryFn: () => getCatalog(),
  });

  const { data: adminCatalog } = useQuery({
    queryKey: ["bergamo", "admin-catalog", session?.user.id],
    queryFn: () => getAdminCatalog(),
    enabled: isAdmin,
    retry: false,
  });

  const { data: offer } = useQuery({
    queryKey: ["bergamo", "offer"],
    queryFn: () => getOffer(),
  });

  const data = adminCatalog ?? publicCatalog;

  const items = data?.items ?? [];
  const categories = data?.categories ?? [];
  const totalCount = data?.totalCount ?? 0;
  const checkoutUrl = offer?.checkoutUrl ?? null;

  return (
    <div className="bergamo-theme min-h-screen bg-background font-sans text-foreground antialiased">
      <PrivacyCurtain />
      <BergamoHeader ctaHref={checkoutUrl} />
      <main className="protected-content">
        <BergamoHero items={items} totalCount={totalCount} checkoutUrl={checkoutUrl} />
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
