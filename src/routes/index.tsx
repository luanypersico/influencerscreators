import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import { PromptBuilder } from "@/components/PromptBuilder";
import { PromptLibrary } from "@/components/PromptLibrary";
import { PromptStudio } from "@/components/PromptStudio";
import { RealismRules } from "@/components/RealismRules";

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
      <PromptStudio />
      <PromptBuilder />
      <PromptLibrary />
      <RealismRules />
      <Footer />
      <Toaster />
    </main>
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
