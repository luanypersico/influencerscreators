import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { brl, centsFromInput } from "@/lib/format";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  checkout_url: string | null;
  checkout_url_secondary: string | null;
  status: string;
  is_coproduction: boolean;
  coproducer_name: string | null;
  coproducer_email: string | null;
  revenue_share_pct: number | null;
  sort_order: number;
};

const EMPTY: Partial<ProductRow> = {
  slug: "",
  name: "",
  status: "draft",
  price_cents: 0,
  is_coproduction: false,
  revenue_share_pct: 0,
  sort_order: 0,
};

export function ProductDialog({
  open,
  product,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  product: ProductRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<ProductRow>>(EMPTY);
  const [priceInput, setPriceInput] = useState("0");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(product ?? EMPTY);
    setPriceInput(((product?.price_cents ?? 0) / 100).toFixed(2).replace(".", ","));
  }, [product, open]);

  function set<K extends keyof ProductRow>(key: K, value: ProductRow[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.name?.trim() || !form.slug?.trim()) {
      toast.error("Nome e slug são obrigatórios.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        tagline: form.tagline ?? null,
        description: form.description ?? null,
        price_cents: centsFromInput(priceInput),
        compare_at_cents: form.compare_at_cents ?? null,
        checkout_url: form.checkout_url ?? null,
        checkout_url_secondary: form.checkout_url_secondary ?? null,
        status: form.status ?? "draft",
        is_coproduction: Boolean(form.is_coproduction),
        coproducer_name: form.coproducer_name ?? null,
        coproducer_email: form.coproducer_email ?? null,
        revenue_share_pct: form.revenue_share_pct ?? 0,
        sort_order: form.sort_order ?? 0,
      };

      const { error } = product
        ? await supabase.from("products").update(payload).eq("id", product.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;

      await supabase.from("admin_audit_log").insert({
        action: product ? "product.update" : "product.create",
        entity: "product",
        entity_id: product?.id ?? payload.slug,
        actor_id: (await supabase.auth.getUser()).data.user?.id ?? null,
        meta: { slug: payload.slug } as never,
      });

      toast.success(product ? "Produto atualizado." : "Produto criado.");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome">
            <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Slug (URL)">
            <Input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Chamada curta">
            <Input value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Status">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.status ?? "draft"}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="archived">Arquivado</option>
            </select>
          </Field>
          <Field label={`Preço (${brl(centsFromInput(priceInput))})`}>
            <Input value={priceInput} onChange={(e) => setPriceInput(e.target.value)} />
          </Field>
          <Field label="Preço de ancoragem (centavos)">
            <Input
              type="number"
              value={form.compare_at_cents ?? 0}
              onChange={(e) => set("compare_at_cents", Number(e.target.value))}
            />
          </Field>
          <Field label="Link de checkout principal">
            <Input
              value={form.checkout_url ?? ""}
              onChange={(e) => set("checkout_url", e.target.value)}
            />
          </Field>
          <Field label="Link de checkout secundário">
            <Input
              value={form.checkout_url_secondary ?? ""}
              onChange={(e) => set("checkout_url_secondary", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição">
              <Textarea
                rows={3}
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium">Produto em co-produção</p>
              <p className="text-xs text-muted-foreground">
                Define o split de receita com o parceiro.
              </p>
            </div>
            <Switch
              checked={Boolean(form.is_coproduction)}
              onCheckedChange={(v) => set("is_coproduction", v)}
            />
          </div>

          {form.is_coproduction && (
            <>
              <Field label="Nome do parceiro">
                <Input
                  value={form.coproducer_name ?? ""}
                  onChange={(e) => set("coproducer_name", e.target.value)}
                />
              </Field>
              <Field label="E-mail do parceiro">
                <Input
                  value={form.coproducer_email ?? ""}
                  onChange={(e) => set("coproducer_email", e.target.value)}
                />
              </Field>
              <Field label="% do parceiro">
                <Input
                  type="number"
                  value={form.revenue_share_pct ?? 0}
                  onChange={(e) => set("revenue_share_pct", Number(e.target.value))}
                />
              </Field>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Salvando..." : "Salvar produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
