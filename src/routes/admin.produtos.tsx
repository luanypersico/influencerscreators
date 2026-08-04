import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { AdminPage, Panel } from "@/components/admin/AdminPage";
import { ProductDialog, type ProductRow } from "@/components/admin/ProductDialog";
import { ProductItemsSheet } from "@/components/admin/ProductItemsSheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/produtos")({
  component: ProductsPage,
});

function ProductsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contentProduct, setContentProduct] = useState<ProductRow | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("sort_order");
      if (error) throw error;
      return data as unknown as ProductRow[];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["admin", "product_counts"],
    queryFn: async () => {
      const [{ data: items }, { data: access }] = await Promise.all([
        supabase.from("product_items").select("product_id"),
        supabase.from("product_access").select("product_id"),
      ]);
      return { items: items ?? [], access: access ?? [] };
    },
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin", "products"] });
    await qc.invalidateQueries({ queryKey: ["admin", "product_counts"] });
  }

  return (
    <AdminPage
      title="Produtos"
      description="Controle total: preço, checkout, status, split de co-produção e todo o conteúdo entregue."
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Novo produto
        </Button>
      }
    >
      <Panel title="Catálogo">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        <div className="space-y-3">
          {(products ?? []).map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    /{p.slug}
                  </span>
                  <span
                    className={
                      p.status === "active"
                        ? "rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
                        : "rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                    }
                  >
                    {p.status}
                  </span>
                  {p.is_coproduction && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                      co-produção {p.revenue_share_pct}%
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {brl(p.price_cents)} ·{" "}
                  {(counts?.items ?? []).filter((i) => i.product_id === p.id).length} itens ·{" "}
                  {(counts?.access ?? []).filter((a) => a.product_id === p.id).length} clientes
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setContentProduct(p)}>
                  Conteúdo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(p);
                    setDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={async () => {
                    if (!confirm(`Arquivar "${p.name}"?`)) return;
                    await supabase.from("products").update({ status: "archived" }).eq("id", p.id);
                    await refresh();
                  }}
                >
                  Arquivar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <ProductDialog
        open={dialogOpen}
        product={editing}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />

      <ProductItemsSheet
        productId={contentProduct?.id ?? null}
        productName={contentProduct?.name ?? ""}
        productSlug={contentProduct?.slug ?? ""}
        onOpenChange={(open) => {
          if (!open) setContentProduct(null);
        }}
      />
    </AdminPage>
  );
}