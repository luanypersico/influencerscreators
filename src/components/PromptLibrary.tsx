import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PromptCard } from "@/components/PromptCard";
import { CATEGORIES, PROMPTS, type CategoryId } from "@/data/prompts";
import { NEGATIVE_PROMPT } from "@/data/builder";
import { cn } from "@/lib/utils";

type Filter = CategoryId | "all";

/** Searchable, filterable prompt library. All filtering is derived state. */
export function PromptLibrary() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPTS.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
      );
    });
  }, [filter, query]);

  return (
    <section id="biblioteca" className="border-t border-border px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
              Biblioteca
            </span>
            <h2 className="mt-2 text-4xl md:text-5xl">{PROMPTS.length} prompts prontos</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Cada um escrito em inglês, com câmera, lente, luz e imperfeição já especificados. Copie
              e cole direto no seu gerador.
            </p>
          </div>

          <label className="relative w-full md:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <span className="sr-only">Buscar prompts</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="flash, praia, gym, video..."
              className="w-full border border-input bg-card py-2.5 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </label>
        </header>

        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Todos
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </FilterChip>
          ))}
        </div>

        {results.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            Nada encontrado para “{query}”. Tente um termo mais curto.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <PromptCard key={p.id} prompt={p} suffix={NEGATIVE_PROMPT} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  children,
  ...rest
}: React.ComponentProps<"button"> & { active: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "border px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}