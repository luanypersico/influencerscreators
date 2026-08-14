import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage, Panel } from "@/components/admin/AdminPage";
import { OfferDialog, type OfferRow } from "@/components/admin/OfferDialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/ofertas")({
  component: OffersPage,
});

function OffersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<OfferRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: offers, isLoading } = useQuery({
    queryKey: ["admin", "member_offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_offers")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as OfferRow[];
    },
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin", "member_offers"] });
  }

  async function toggleActive(offer: OfferRow) {
    const { error } = await supabase
      .from("member_offers")
      .update({ active: !offer.active })
      .eq("id", offer.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("admin_audit_log").insert({
      action: offer.active ? "member_offer.deactivate" : "member_offer.activate",
      entity: "member_offer",
      entity_id: offer.id,
      actor_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      meta: { title: offer.title } as never,
    });
    await refresh();
  }

  async function remove(offer: OfferRow) {
    if (!confirm(`Excluir definitivamente "${offer.title}"?`)) return;
    const { error } = await supabase.from("member_offers").delete().eq("id", offer.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("admin_audit_log").insert({
      action: "member_offer.delete",
      entity: "member_offer",
      entity_id: offer.id,
      actor_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      meta: { title: offer.title } as never,
    });
    toast.success("Oferta excluída.");
    await refresh();
  }

  return (
    <AdminPage
      title="Produtos recomendados"
      description="Vitrine de ofertas afiliadas mostrada em /membros. Nunca concede acesso, nunca cria pedido — é só recomendação. A compra e a entrega continuam acontecendo fora do Arsenal."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Nova oferta
        </Button>
      }
    >
      <Panel title="Ofertas">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && (offers ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma oferta cadastrada ainda.</p>
        )}
        <div className="space-y-3">
          {(offers ?? []).map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                {o.cover_url ? (
                  <img
                    src={o.cover_url}
                    alt=""
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-12 shrink-0 rounded-lg bg-muted" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{o.title}</p>
                    <span
                      className={
                        o.active
                          ? "rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
                          : "rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      }
                    >
                      {o.active ? "ativo" : "inativo"}
                    </span>
                    {o.badge && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                        {o.badge}
                      </span>
                    )}
                    {!o.checkout_url && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive">
                        sem link de checkout
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    ordem {o.sort_order} · {o.checkout_url || "link não configurado"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleActive(o)}>
                  {o.active ? "Desativar" : "Ativar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(o);
                    setDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => remove(o)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <OfferDialog open={dialogOpen} offer={editing} onOpenChange={setDialogOpen} onSaved={refresh} />
    </AdminPage>
  );
}
