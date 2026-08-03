import { SiteButton } from "@/components/site/SiteButton";

/** Shown on /studio-demo/$slug when there's no studio demo for that slug. */
export function StudioNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
        Estúdio não disponível
      </span>
      <h1 className="mt-3 text-4xl md:text-5xl">
        Essa personagem ainda não tem estúdio demonstrativo
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        A demonstração do estúdio está disponível hoje só para a Mari. Conheça o catálogo completo
        da Casa do Influencer AI.
      </p>
      <SiteButton to="/influencers" className="mt-6">
        Ver todas as influencers
      </SiteButton>
    </div>
  );
}
