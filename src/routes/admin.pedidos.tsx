import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage, Panel, StatCard } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { brl, centsFromInput, dateBR } from "@/lib/format";

export const Route = createFileRoute("/admin/pedidos")({
  component: OrdersPage,
});

function OrdersPage() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [productId, setProductId] = useState("");
  const [provider, setProvider] = useState("manual");

  const { data: products } = useQuery({
    queryKey: ["admin", "products", "options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, price_cents").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const paid = (orders ?? []).filter((o) => o.status === "paid");
  const productName = (id: string | null) => products?.find((p) => p.id === id)?.name ?? "—";

  async function createOrder() {
    if (!email.includes("@")) {
      toast.error("Informe o e-mail do comprador.");
      return;
    }
    const { error } = await supabase.from("orders").insert({
      buyer_email: email.trim().toLowerCase(),
      product_id: productId || null,
      amount_cents: centsFromInput(amount),
      status: "paid",
      provider,
      paid_at: new Date().toISOString(),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Pedido registrado.");
    setEmail("");
    setAmount("");
    await qc.invalidateQueries({ queryKey: ["admin", "orders"] });
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else await qc.invalidateQueries({ queryKey: ["admin", "orders"] });
  }

  return (
    <AdminPage title="Vendas & pedidos" description="Registre vendas, acompanhe status e veja os leads capturados.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Receita paga" value={brl(paid.reduce((s, o) => s + o.amount_cents, 0))} />
        <StatCard label="Pedidos pagos" value={String(paid.length)} />
        <StatCard label="Leads" value={String(leads?.length ?? 0)} />
      </div>

      <Panel title="Registrar venda manualmente">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">E-mail do comprador</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Produto</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const p = products?.find((x) => x.id === e.target.value);
                if (p) setAmount(((p.price_cents ?? 0) / 100).toFixed(2).replace(".", ","));
              }}
            >
              <option value="">Selecione</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Origem</Label>
            <Input value={provider} onChange={(e) => setProvider(e.target.value)} />
          </div>
        </div>
        <Button className="mt-4" size="sm" onClick={createOrder}>
          Registrar pedido pago
        </Button>
      </Panel>

      <Panel title="Pedidos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Comprador</th>
                <th className="py-2 pr-4">Produto</th>
                <th className="py-2 pr-4">Valor</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o) => (
                <tr key={o.id} className="border-t border-border/60">
                  <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">{dateBR(o.created_at)}</td>
                  <td className="py-2 pr-4">{o.buyer_email}</td>
                  <td className="py-2 pr-4">{productName(o.product_id)}</td>
                  <td className="py-2 pr-4">{brl(o.amount_cents)}</td>
                  <td className="py-2 pr-4">{o.status}</td>
                  <td className="py-2">
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {["pending", "paid", "refunded", "chargeback", "canceled"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders?.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum pedido registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Leads">
        <div className="space-y-1 text-sm">
          {(leads ?? []).map((l) => (
            <div key={l.id} className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2">
              <span>{l.email}</span>
              <span className="text-xs text-muted-foreground">
                {l.source ?? "site"} · {dateBR(l.created_at)}
              </span>
            </div>
          ))}
          {leads?.length === 0 && <p className="text-muted-foreground">Nenhum lead ainda.</p>}
        </div>
      </Panel>
    </AdminPage>
  );
}