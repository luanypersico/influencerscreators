import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Container } from "@/components/site/Container";
import { SectionTitle } from "@/components/site/SectionTitle";
import { InfluencerCard } from "@/features/influencers/components/InfluencerCard";
import { ALL_NICHES, PUBLIC_INFLUENCERS } from "@/features/influencers/data/publicInfluencers";
import type { InfluencerStatus } from "@/features/influencers/types";
import { cn } from "@/lib/utils";

const TITLE = "Influencers — A Casa";
const DESCRIPTION = "Conheça as influencers virtuais exclusivas disponíveis na Casa.";

export const Route = createFileRoute("/_public/influencers/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: InfluencersCatalog,
});

type NicheFilter = string | "all";
type StatusFilter = InfluencerStatus | "all";

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "available", label: "Disponível" },
  { id: "reserved", label: "Reservada" },
  { id: "sold", label: "Vendida" },
  { id: "coming_soon", label: "Em breve" },
];

function InfluencersCatalog() {
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState<NicheFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PUBLIC_INFLUENCERS.filter((influencer) => {
      if (niche !== "all" && !influencer.niches.includes(niche)) return false;
      if (status !== "all" && influencer.status !== status) return false;
      if (!q) return true;
      return (
        influencer.name.toLowerCase().includes(q) || influencer.tagline.toLowerCase().includes(q)
      );
    });
  }, [query, niche, status]);

  return (
    <div className="py-16 md:py-20">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            kicker="Catálogo"
            title="Influencers da Casa"
            subtitle="Cada personagem tem identidade, personalidade e universo visual próprios."
            headingAs="h1"
          />
          <label className="relative w-full md:w-72">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <span className="sr-only">Buscar por nome</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full rounded-full border border-input bg-card py-2.5 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <FilterRow
            label="Nicho"
            active={niche}
            options={[
              { id: "all", label: "Todos" },
              ...ALL_NICHES.map((n) => ({ id: n, label: n })),
            ]}
            onSelect={(id) => setNiche(id)}
          />
          <FilterRow
            label="Status"
            active={status}
            options={STATUS_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
            onSelect={(id) => setStatus(id as StatusFilter)}
          />
        </div>

        {results.length === 0 ? (
          <p className="mt-16 text-sm text-muted-foreground">
            Nenhuma influencer encontrada com esses filtros. Tente ajustar a busca ou limpar os
            filtros.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

function FilterRow({
  label,
  active,
  options,
  onSelect,
}: {
  label: string;
  active: string;
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </span>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={active === option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            active === option.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
