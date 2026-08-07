import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { CATEGORIES, type Prompt } from "@/data/prompts";
import { cn } from "@/lib/utils";

export interface PresetRailProps {
  presets: Prompt[];
  activeId: string | null;
  onSelect: (preset: Prompt) => void;
}

/** Horizontal preset rail. Scrolls by roughly one card per arrow click. */
export function PresetRail({ presets, activeId, onSelect }: PresetRailProps) {
  const track = useRef<HTMLDivElement | null>(null);

  const nudge = (dir: 1 | -1) => {
    track.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-card-foreground">
          Presets realistas <span className="text-muted-foreground">↓</span>
        </h2>
        <div className="flex gap-1">
          <RailButton label="Anterior" onClick={() => nudge(-1)}>
            <ChevronLeft className="size-4" />
          </RailButton>
          <RailButton label="Próximo" onClick={() => nudge(1)}>
            <ChevronRight className="size-4" />
          </RailButton>
        </div>
      </div>

      <div
        ref={track}
        className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        {presets.map((preset) => {
          const active = preset.id === activeId;
          const category = CATEGORIES.find((c) => c.id === preset.category);
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(preset)}
              className={cn(
                "group w-[13rem] shrink-0 snap-start rounded-xl border p-4 text-left transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              <span
                className={cn(
                  "text-[0.6rem] font-semibold tracking-[0.16em] uppercase",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {category?.label ?? preset.category}
              </span>
              <span className="mt-1.5 block text-sm leading-snug font-medium text-foreground">
                {preset.title}
              </span>
              <span className="mt-1.5 block text-xs leading-snug text-muted-foreground">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RailButton({
  label,
  children,
  ...rest
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      {...rest}
    >
      {children}
    </button>
  );
}
