import { useState } from "react";

import type { SampleContent } from "@/features/influencers/types";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "stories", label: "Stories de hoje" },
  { id: "feed", label: "Foto para o feed" },
  { id: "ugc", label: "UGC de produto" },
] as const;

type OptionId = (typeof OPTIONS)[number]["id"];

export interface DemoCreationTeaserProps {
  name: string;
  sampleContent: SampleContent | undefined;
}

/**
 * "O que ela pode criar hoje?" — a scripted preview of the studio experience.
 * Picking an option only swaps which pre-made examples are shown; nothing is
 * generated and no prompt is ever exposed.
 */
export function DemoCreationTeaser({ name, sampleContent }: DemoCreationTeaserProps) {
  const [choice, setChoice] = useState<OptionId | null>(null);
  const items = choice && sampleContent ? sampleContent[choice] : [];

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">Escolha um tipo de conteúdo:</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={choice === option.id}
            onClick={() => setChoice(option.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              choice === option.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {choice && (
        <div className="mt-6">
          <p className="text-xs text-muted-foreground">
            Você escolheu:{" "}
            <span className="text-foreground">{OPTIONS.find((o) => o.id === choice)?.label}</span>
          </p>
          {items && items.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((item, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border">
                  {item.imageKey && (
                    <img
                      src={item.imageKey}
                      alt={item.caption ?? `${name} — prévia`}
                      width={1024}
                      height={1280}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Prévia em preparação para {name}.</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Prévia ilustrativa do estúdio. A geração real de conteúdo chega em uma próxima etapa.
          </p>
        </div>
      )}
    </div>
  );
}
