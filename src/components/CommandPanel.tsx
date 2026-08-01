import { Check } from "lucide-react";
import { useState } from "react";

import { groupsForMode, type PromptMode } from "@/data/commands";
import { cn } from "@/lib/utils";

export interface CommandPanelProps {
  mode: PromptMode;
  /** Set of selected command ids, namespaced as `${groupId}:${commandId}`. */
  selected: Set<string>;
  onToggle: (key: string) => void;
}

/** Tabbed list of realism commands. Tabs are local UI state; selection is not. */
export function CommandPanel({ mode, selected, onToggle }: CommandPanelProps) {
  const groups = groupsForMode(mode);
  const [tab, setTab] = useState(groups[0]?.id ?? "");
  const active = groups.find((g) => g.id === tab) ?? groups[0];

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-card-foreground">
        Comandos para realismo <span className="text-muted-foreground">↓</span>
      </h2>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {groups.map((group) => {
          const count = group.commands.filter((c) =>
            selected.has(`${group.id}:${c.id}`),
          ).length;
          return (
            <button
              key={group.id}
              type="button"
              aria-pressed={group.id === active?.id}
              onClick={() => setTab(group.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                group.id === active?.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {group.label}
              {count > 0 && <span className="ml-1.5 opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex max-h-[26rem] flex-col gap-2 overflow-y-auto pr-1">
        {active?.commands.map((command) => {
          const key = `${active.id}:${command.id}`;
          const on = selected.has(key);
          return (
            <li key={command.id}>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                onClick={() => onToggle(key)}
                className={cn(
                  "grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/50",
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-[4px] border",
                    on
                      ? "border-primary-foreground/70 bg-primary-foreground/20"
                      : "border-muted-foreground/50",
                  )}
                >
                  {on && <Check className="size-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{command.label}</span>
                  <span
                    className={cn(
                      "block truncate text-xs",
                      on ? "text-primary-foreground/75" : "text-muted-foreground",
                    )}
                  >
                    {command.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}