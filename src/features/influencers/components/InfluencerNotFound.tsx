import { SiteButton } from "@/components/site/SiteButton";

/** Shown on /influencers/$slug when the slug doesn't match anyone — distinct from the site-wide 404. */
export function InfluencerNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-24 text-center">
      <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
        Não encontramos essa personagem
      </span>
      <h1 className="mt-3 text-4xl md:text-5xl">
        Essa personagem não existe na Casa do Influencer AI
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        O link pode estar incorreto, ou a personagem ainda não faz parte do catálogo.
      </p>
      <SiteButton to="/influencers" className="mt-6">
        Ver todas as influencers
      </SiteButton>
    </div>
  );
}
