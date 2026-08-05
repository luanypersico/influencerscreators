import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export function ProductItemsSheet({
  productId,
  productName,
  productSlug,
  onOpenChange,
}: {
  productId: string | null;
  productName: string;
  productSlug: string;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: items } = useQuery({
    queryKey: ["admin", "product_items", productId],
    enabled: Boolean(productId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_items")
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin", "product_items", productId] });
  }

  type ItemPatch = {
    code?: string;
    title?: string;
    category?: string;
    prompt?: string;
    is_free?: boolean;
    status?: string;
  };

  async function update(id: string, patch: ItemPatch) {
    const { error } = await supabase.from("product_items").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  }

  async function addItem() {
    const { error } = await supabase.from("product_items").insert({
      product_id: productId!,
      title: "Novo item",
      sort_order: (items?.length ?? 0) + 1,
    });
    if (error) toast.error(error.message);
    else await refresh();
  }

  const filtered = (items ?? []).filter(
    (i) =>
      !search.trim() ||
      `${i.code ?? ""} ${i.title} ${i.category ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Sheet open={Boolean(productId)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Conteúdo · {productName}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button size="sm" variant="outline" onClick={addItem}>
            Adicionar item
          </Button>
          {productSlug === "bergamo" && (
            <span className="text-xs text-muted-foreground">
              Conteúdo do Bergamo agora é gerenciado no workspace do coprodutor.
            </span>
          )}
          <span className="text-xs text-muted-foreground">{items?.length ?? 0} itens</span>
        </div>

        <div className="mt-4 space-y-3 pb-10">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  className="h-8 w-16"
                  value={item.code ?? ""}
                  onChange={(e) => update(item.id, { code: e.target.value })}
                />
                <Input
                  className="h-8 flex-1"
                  value={item.title}
                  onChange={(e) => update(item.id, { title: e.target.value })}
                />
                <Input
                  className="h-8 w-36"
                  placeholder="categoria"
                  value={item.category ?? ""}
                  onChange={(e) => update(item.id, { category: e.target.value })}
                />
              </div>
              <Textarea
                rows={3}
                className="mt-2 font-mono text-xs"
                value={item.prompt ?? ""}
                onChange={(e) => update(item.id, { prompt: e.target.value })}
              />
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={item.is_free}
                    onCheckedChange={(v) => update(item.id, { is_free: v })}
                  />
                  Amostra gratuita
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={item.status === "active"}
                    onCheckedChange={(v) => update(item.id, { status: v ? "active" : "hidden" })}
                  />
                  Visível
                </label>
                <button
                  className="text-destructive hover:underline"
                  onClick={async () => {
                    await supabase.from("product_items").delete().eq("id", item.id);
                    await refresh();
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum item. Importe o catálogo ou adicione manualmente.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
