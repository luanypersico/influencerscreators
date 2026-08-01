import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import heroPortrait from "@/assets/hero-portrait.jpg";
import { PromptBuilder } from "@/components/PromptBuilder";
import { PromptLibrary } from "@/components/PromptLibrary";
import { RealismRules } from "@/components/RealismRules";
import { PROMPTS } from "@/data/prompts";

const TITLE = "Prompts de realismo para influencers de IA";
const DESCRIPTION =
  "Biblioteca de prompts e montador para gerar influencers de IA fotorrealistas: câmera, lente, luz e imperfeição de pele especificadas. Copie e cole.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${TITLE} — Realismo` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <PromptBuilder />
      <PromptLibrary />
      <RealismRules />
      <Footer />
      <Toaster />
    </main>
  );
}

function Hero() {
  return (
    <header className="grain relative overflow-hidden px-6 pt-20 pb-16 md:px-10 md:pt-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "var(--glow-ember)" }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <span className="inline-flex items-center gap-2 border border-border px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
            {PROMPTS.length} prompts · 9 eixos · 1 método
          </span>
          <h1 className="mt-6 text-5xl leading-[0.95] md:text-7xl">
            Tire a cara de IA da sua{" "}
            <em className="text-primary italic">influencer</em>.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Prompts de nível fotográfico para gerar pessoas que parecem pessoas: câmera e lente
            nomeadas, uma fonte de luz descrita, poro, brilho e fio de cabelo fora do lugar no
            lugar certo. Tudo em inglês, porque é assim que os modelos obedecem.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#montador"
              className="border border-primary bg-primary px-5 py-3 text-xs font-semibold tracking-[0.14em] text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              Montar meu prompt
            </a>
            <a
              href="#biblioteca"
              className="border border-border px-5 py-3 text-xs font-semibold tracking-[0.14em] text-foreground uppercase transition-colors hover:border-primary/60 hover:text-primary"
            >
              Ver a biblioteca
            </a>
          </div>
        </div>

        <figure className="relative">
          <img
            src={heroPortrait}
            alt="Retrato fotorrealista com textura de pele preservada: poros, brilho natural e imperfeições visíveis"
            width={1024}
            height={1280}
            className="w-full border border-border object-cover"
          />
          <figcaption className="mt-2 font-mono text-[0.65rem] text-muted-foreground">
            85mm f/1.4 · janela nublada · pele sem retoque
          </figcaption>
        </figure>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Funciona melhor em NanoBanana Pro, GPT Image, Flux e Midjourney. Cole o prompt principal
          e, quando o gerador aceitar, o negative prompt separadamente.
        </p>
        <p className="text-xs text-muted-foreground">
          Use com responsabilidade: sinalize conteúdo gerado por IA e não crie imagens de pessoas
          reais sem consentimento.
        </p>
      </div>
    </footer>
  );
}
