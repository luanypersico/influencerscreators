import { SectionTitle } from "@/components/site/SectionTitle";

const FORMATS = ["Stories", "Feed", "Reels", "UGC", "TikTok Shop", "Reviews", "Anúncios"];

export function ContentPossibilitiesSection() {
  return (
    <section className="border-t border-border px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          kicker="Estúdio"
          title="Conteúdo que ela pode produzir"
          subtitle="Cada formato usa a mesma identidade, rotina e universo visual da personagem."
        />

        <div className="mt-8 flex flex-wrap gap-2.5">
          {FORMATS.map((format) => (
            <span
              key={format}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground"
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
