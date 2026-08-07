import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AdminPage, Panel, StatCard } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { adminOverviewFn } from "@/lib/admin.functions";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchOverview = useServerFn(adminOverviewFn);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => fetchOverview(),
  });

  return (
    <AdminPage
      title="Visão geral"
      description="O retrato do negócio: receita, produtos, clientes e acessos."
      actions={
        <Button asChild variant="outline">
          <Link to="/admin/produtos">Gerenciar produtos</Link>
        </Button>
      }
    >
      {isLoading && <p className="text-sm text-muted-foreground">Carregando indicadores...</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Receita paga"
              value={brl(data.revenueCents)}
              hint={`${data.paidOrders} pedidos pagos`}
            />
            <StatCard
              label="Clientes com acesso"
              value={String(data.accessCount)}
              hint="liberações ativas"
            />
            <StatCard
              label="Usuários"
              value={String(data.users)}
              hint={`${data.admins} com painel`}
            />
            <StatCard label="Leads capturados" value={String(data.leads)} />
          </div>

          <Panel
            title="Desempenho por produto"
            description="Inclui produtos em co-produção e o seu split."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">Produto</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Clientes</th>
                    <th className="py-2 pr-4">Receita</th>
                    <th className="py-2 pr-4">Co-produção</th>
                    <th className="py-2">Sua parte</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p) => {
                    const mine = p.isCoproduction
                      ? Math.round(p.revenueCents * (1 - p.sharePct / 100))
                      : p.revenueCents;
                    return (
                      <tr key={p.id} className="border-t border-border/60">
                        <td className="py-2 pr-4 font-medium">{p.name}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{p.status}</td>
                        <td className="py-2 pr-4">{p.buyers}</td>
                        <td className="py-2 pr-4">{brl(p.revenueCents)}</td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {p.isCoproduction ? `sim (${p.sharePct}% parceiro)` : "não"}
                        </td>
                        <td className="py-2 font-medium">{brl(mine)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Receita dos últimos dias">
            {data.revenueByDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma venda registrada ainda. Registre pedidos em Vendas & pedidos ou conecte seu
                checkout.
              </p>
            ) : (
              <div className="flex items-end gap-2">
                {data.revenueByDay.map((d) => {
                  const max = Math.max(...data.revenueByDay.map((x) => x.cents)) || 1;
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary/70"
                        style={{ height: `${Math.max(4, (d.cents / max) * 120)}px` }}
                        title={`${d.day}: ${brl(d.cents)}`}
                      />
                      <span className="text-[10px] text-muted-foreground">{d.day.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </>
      )}
    </AdminPage>
  );
}
