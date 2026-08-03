import heroPortrait from "@/assets/hero-portrait.jpg";
import { SiteButton } from "@/components/site/SiteButton";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pt-12 pb-16 md:px-10 md:pt-20 md:pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--glow-ember)" }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <h1 className="text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
            Encontre a influencer que vai representar sua próxima marca.
          </h1>
          <p className="mt-6 max-w-lg text-base text-muted-foreground md:text-lg">
            Influencers virtuais exclusivas, com identidade e personalidade próprias, vida digital
            e, futuramente, estúdio próprio de criação de conteúdo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SiteButton to="/influencers">Conhecer influencers</SiteButton>
            <SiteButton to="/como-funciona" variant="outline">
              Como funciona
            </SiteButton>
          </div>
        </div>

        <div className="grain overflow-hidden rounded-3xl border border-border">
          <img
            src={heroPortrait}
            alt="Influencer virtual da Casa, retrato editorial"
            width={1024}
            height={1280}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
