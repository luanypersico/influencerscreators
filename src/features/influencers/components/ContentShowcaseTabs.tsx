import { useState } from "react";

import type { SampleContent, SampleContentItem } from "@/features/influencers/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "feed", label: "Feed" },
  { id: "stories", label: "Stories" },
  { id: "reels", label: "Reels" },
  { id: "ugc", label: "UGC" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export interface ContentShowcaseTabsProps {
  sampleContent: SampleContent | undefined;
  name: string;
}

/** Feed / Stories / Reels / UGC — proof of what the character can produce. Browsable only, nothing downloadable. */
export function ContentShowcaseTabs({ sampleContent, name }: ContentShowcaseTabsProps) {
  const [tab, setTab] = useState<TabId>("feed");
  const items: SampleContentItem[] = sampleContent?.[tab] ?? [];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Formatos de conteúdo">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Exemplos de {TABS.find((t) => t.id === tab)?.label.toLowerCase()} de {name} em preparação.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, i) => (
            <figure key={i} className="overflow-hidden rounded-xl border border-border bg-card">
              {item.imageKey && (
                <img
                  src={item.imageKey}
                  alt={item.caption ?? `${name} — ${tab}`}
                  width={1024}
                  height={1280}
                  className="aspect-[4/5] w-full object-cover"
                />
              )}
              {item.caption && (
                <figcaption className="p-3 text-xs text-muted-foreground">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
