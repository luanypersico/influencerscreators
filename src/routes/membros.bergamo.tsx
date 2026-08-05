import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CopyButton } from "@/components/CopyButton";
import { SiteButton } from "@/components/site/SiteButton";
import { useSession } from "@/hooks/useAuth";
import { memberGetBergamoContentFn } from "@/lib/member.functions";
import type { BergamoMemberItem } from "@/lib/member.server";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/membros/bergamo")({
  head: () => ({
    meta: [
      { title: "Arsenal Bergamo — Membros" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BergamoMembersPage,
});

function CenteredNote({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    </div>
  );
}

/** Sem acesso ativo ao Bergamo: nenhum prompt chega aqui, nem no HTML nem no JSON da resposta. */
function AccessNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Acesso não encontrado</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Não encontramos um acesso ativo ao Bergamo para esta conta.
      </p>
      <SiteButton to="/bergamo">Voltar para o Bergamo</SiteButton>
    </div>
  );
}

function PromptCard({ item }: { item: BergamoMemberItem }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-secondary/60 px-2.5 py-1 text-[10px] font-medium tracking-wide text-foreground/80 uppercase">
          {item.category}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">#{item.code}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-foreground">{item.title}</h3>
      {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}

      {open && (
        <p className="mt-3 max-h-64 overflow-y-auto rounded-xl bg-secondary/40 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
          {item.prompt}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
        >
          {open ? "Ocultar prompt" : "Ver prompt completo"}
        </button>
        <CopyButton value={item.prompt} />
      </div>
    </article>
  );
}

function BergamoMembersPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const getContent = useServerFn(memberGetBergamoContentFn);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  const {
    data: content,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["member", "bergamo-content"],
    queryFn: () => getContent(),
    enabled: Boolean(session),
  });

  const filtered = useMemo(() => {
    if (!content) return [];
    const q = query.trim().toLowerCase();
    return content.items.filter((item) => {
      const matchesCategory = category === "Todos" || item.category === category;
      const matchesQuery =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [content, query, category]);

  if (loading || (session && isLoading)) {
    return <CenteredNote title="Carregando..." />;
  }
  if (!session) {
    return <CenteredNote title="Redirecionando para o login..." />;
  }
  if (isFetched && !content) {
    return <AccessNotFound />;
  }
  if (!content) {
    return <CenteredNote title="Carregando..." />;
  }

  const lastUpdate = content.updates[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
            Área de membros
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Arsenal Bergamo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {content.items.length} prompts liberados para você.
            {lastUpdate &&
              ` Última atualização em ${new Date(lastUpdate.publishedAt ?? "").toLocaleDateString("pt-BR")}.`}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {content.updates.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
              Atualizações recentes
            </h2>
            <div className="mt-3 space-y-3">
              {content.updates.slice(0, 3).map((update) => (
                <article key={update.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{update.title}</h3>
                    {update.publishedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.publishedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{update.content}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-4">
          <label className="relative block max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar prompt..."
              aria-label="Buscar prompts"
              className="w-full rounded-full border border-input bg-card py-3 pr-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {["Todos", ...content.categories].map((item) => (
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

        <p className="mt-6 text-xs text-muted-foreground">{filtered.length} prompts encontrados</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <PromptCard key={item.code} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Nenhum prompt encontrado para essa busca.
          </p>
        )}
      </main>
    </div>
  );
}
