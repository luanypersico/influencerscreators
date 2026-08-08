import heroAi from "@/assets/hero-ai.jpg";
import heroPortrait from "@/assets/hero-portrait.jpg";
import { SiteButton } from "@/components/site/SiteButton";

/** Primary sales hero for A Casa — a product-first visual, not a marketplace clone. */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 md:px-10 md:pb-28 md:pt-24">
      <div aria-hidden="true" className="studio-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16">
        <div>
          <span className="studio-kicker inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
            Identidade digital que cria
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl leading-[0.98] md:text-6xl lg:text-7xl">
            Sua marca merece uma presença que não parece IA.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Conheça personagens digitais com repertório, direção criativa e consistência visual para
            transformar uma ideia em conteúdo que as pessoas querem acompanhar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SiteButton to="/influencers">Conhecer influencers</SiteButton>
            <SiteButton to="/como-funciona" variant="outline">
              Como funciona
            </SiteButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div
            className="absolute -inset-8 rounded-[3rem] bg-primary/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="studio-surface grain relative overflow-hidden rounded-[2rem] p-2">
            <img
              src={heroPortrait}
              alt="Influencer virtual da Casa, retrato editorial"
              width={1024}
              height={1280}
              className="aspect-[4/5] w-full rounded-[1.55rem] object-cover"
            />
            <div className="absolute right-5 bottom-5 left-5 rounded-2xl border border-foreground/10 bg-background/70 p-4 backdrop-blur-xl">
              <p className="studio-kicker">Uma identidade, infinitas direções</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Crie campanhas que começam com personalidade.
              </p>
            </div>
          </div>
          <div className="studio-surface absolute -right-5 -bottom-7 hidden w-44 overflow-hidden rounded-2xl p-1.5 sm:block">
            <img src={heroAi} alt="" className="aspect-square w-full rounded-xl object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
