import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { CopyButton } from "@/components/CopyButton";
import { CATEGORIES, type Prompt } from "@/data/prompts";
import { cn } from "@/lib/utils";

export interface PromptCardProps {
  prompt: Prompt;
  /** Text appended on copy (negative prompt block). */
  suffix?: string;
}

/** Collapsible prompt card. Collapsed by default to keep the grid scannable. */
export function PromptCard({ prompt, suffix }: PromptCardProps) {
  const [open, setOpen] = useState(false);
  const category = CATEGORIES.find((c) => c.id === prompt.category);
  const copyValue = suffix ? `${prompt.prompt}\n\nNegative prompt: ${suffix}` : prompt.prompt;

  return (
    <article className="flex flex-col border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
            {category?.label ?? prompt.category}
          </span>
          <h3 className="mt-1 text-xl leading-tight text-card-foreground">{prompt.title}</h3>
        </div>
        <CopyButton value={copyValue} />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{prompt.description}</p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 flex items-center gap-1.5 self-start text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {open ? "Esconder prompt" : "Ver prompt"}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <pre className="mt-3 max-h-72 overflow-auto border border-border bg-background p-3 font-mono text-[0.7rem] leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {prompt.prompt}
        </pre>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {prompt.tags.map((tag) => (
          <span key={tag} className="border border-border px-2 py-0.5 text-[0.65rem] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}