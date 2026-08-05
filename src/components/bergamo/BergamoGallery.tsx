import { Lock, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CopyButton } from "@/components/CopyButton";
import { bergamoImage } from "@/data/bergamoAssets";
import type { BergamoCatalogItem } from "@/lib/bergamo-catalog.server";
import { cn } from "@/lib/utils";

function PromptTile({ item }: { item: BergamoCatalogItem }) {
  const [open, setOpen] = useState(false);
  const locked = !item.isFree || !item.prompt;

  return (
    <article className="group overflow-hidden rounded-3xl border border-border/70 bg-card">
      <div className="bergamo-vignette relative aspect-[4/5] overflow-hidden">
        <img
          src={bergamoImage(item.code)}
          alt={
            locked
              ? `Prévia bloqueada do prompt ${item.title}`
              : `Exemplo de imagem gerada: ${item.title}`
          }
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 z-10 rounded-full bg-background/75 px-2.5 py-1 text-[10px] font-medium tracking-wide text-foreground/90 uppercase backdrop-blur">
          {item.category}
        </span>
        <span className="absolute top-3 right-3 z-10 font-mono text-[10px] text-foreground/70">
          #{item.code}
        </span>

        {locked && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-10 pb-4 text-center">
            <Lock className="size-4 text-white/90" aria-hidden="true" />
            <p className="text-[11px] font-medium text-white/90">Disponível na área de membros</p>
            <a
              href="#planos"
              className="pointer-events-auto rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-black transition-transform hover:-translate-y-0.5"
            >
              Desbloquear os 90 prompts
            </a>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="font-display text-lg leading-snug tracking-tight text-foreground">
          {item.title}
        </h3>

        {item.isFree && item.prompt ? (
          <>
            {open && (
              <p className="max-h-48 overflow-y-auto rounded-2xl bg-secondary/60 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {item.prompt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
              >
                {open ? "Ocultar prompt" : "Ver prompt grátis"}
              </button>
              <CopyButton value={item.prompt} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-3 py-2.5">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5 text-primary" aria-hidden="true" />
              Prompt completo no acervo
            </p>
            <a
              href="#planos"
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
            >
              Desbloquear
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

export interface BergamoGalleryProps {
  items: BergamoCatalogItem[];
  categories: string[];
}

/** Galeria com busca e filtro por categoria sobre o catálogo real do produto (servido pelo backend). */
export function BergamoGallery({ items, categories }: BergamoGalleryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todos");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === "Todos" || item.category === category;
      const matchesQuery =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [items, query, category]);

  return (
    <section id="acervo" className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-24">
      <div className="max-w-2xl">
        <p className="text-[11px] font-medium tracking-[0.2em] text-primary uppercase">O acervo</p>
        <h2 className="mt-3 font-display text-[1.65rem] leading-tight tracking-tight text-balance text-foreground sm:text-4xl">
          {items.length} cenas prontas, cada uma com o prompt exato que gerou a imagem.
        </h2>
        <p className="mt-4 max-w-md text-muted-foreground">
          Navegue pelo acervo real. Três prompts estão liberados para você testar antes de decidir.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        <label className="relative block max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por cena, categoria..."
            aria-label="Buscar prompts do acervo"
            className="w-full rounded-full border border-input bg-card py-3 pr-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
        </label>

        <div id="categorias" className="flex flex-wrap gap-2">
          {["Todos", ...categories].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <PromptTile key={item.code} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Nenhum prompt encontrado para essa busca.
        </p>
      )}
    </section>
  );
}
