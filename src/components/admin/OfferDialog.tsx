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

export type OfferRow = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  checkout_url: string | null;
  badge: string | null;
  sort_order: number;
  active: boolean;
  provider: string | null;
  external_product_id: string | null;
  external_offer_id: string | null;
};

const EMPTY: Partial<OfferRow> = {
  title: "",
  active: true,
  sort_order: 0,
};

/**
 * CRUD da vitrine de ofertas recomendadas (member_offers) — isolada do
 * domínio comercial interno. Nunca cria order/product_access; só grava a
 * própria tabela de vitrine. Mesmo padrão do ProductDialog (client
 * direto + RLS super_admin fazendo a segurança real).
 */
export function OfferDialog({
  open,
  offer,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  offer: OfferRow | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<OfferRow>>(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(offer ?? EMPTY);
  }, [offer, open]);

  function set<K extends keyof OfferRow>(key: K, value: OfferRow[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!form.title?.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        cover_url: form.cover_url?.trim() || null,
        checkout_url: form.checkout_url?.trim() || null,
        badge: form.badge?.trim() || null,
        sort_order: form.sort_order ?? 0,
        active: Boolean(form.active),
        provider: form.provider?.trim() || null,
        external_product_id: form.external_product_id?.trim() || null,
        external_offer_id: form.external_offer_id?.trim() || null,
      };

      const actorId = (await supabase.auth.getUser()).data.user?.id ?? null;

      const { error } = offer
        ? await supabase
            .from("member_offers")
            .update({ ...payload, updated_by: actorId })
            .eq("id", offer.id)
        : await supabase.from("member_offers").insert({ ...payload, created_by: actorId });
      if (error) throw error;

      await supabase.from("admin_audit_log").insert({
        action: offer ? "member_offer.update" : "member_offer.create",
        entity: "member_offer",
        entity_id: offer?.id ?? payload.title,
        actor_id: actorId,
        meta: { title: payload.title } as never,
      });

      toast.success(offer ? "Oferta atualizada." : "Oferta criada.");
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
          <DialogTitle>{offer ? "Editar oferta recomendada" : "Nova oferta recomendada"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nome">
              <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Descrição curta">
              <Textarea
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
          <Field label="URL da capa">
            <Input
              value={form.cover_url ?? ""}
              onChange={(e) => set("cover_url", e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Link do checkout/afiliado">
            <Input
              value={form.checkout_url ?? ""}
              onChange={(e) => set("checkout_url", e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Selo (opcional)">
            <Input value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} />
          </Field>
          <Field label="Ordem">
            <Input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border border-border p-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium">Ativo</p>
              <p className="text-xs text-muted-foreground">
                Só ofertas ativas com link de checkout aparecem para os alunos.
              </p>
            </div>
            <Switch checked={Boolean(form.active)} onCheckedChange={(v) => set("active", v)} />
          </div>

          <details className="sm:col-span-2">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
              Campos avançados (integração futura, opcional)
            </summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <Field label="Provider">
                <Input
                  value={form.provider ?? ""}
                  onChange={(e) => set("provider", e.target.value)}
                />
              </Field>
              <Field label="External Product ID">
                <Input
                  value={form.external_product_id ?? ""}
                  onChange={(e) => set("external_product_id", e.target.value)}
                />
              </Field>
              <Field label="External Offer ID">
                <Input
                  value={form.external_offer_id ?? ""}
                  onChange={(e) => set("external_offer_id", e.target.value)}
                />
              </Field>
            </div>
          </details>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Salvando..." : "Salvar oferta"}
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
