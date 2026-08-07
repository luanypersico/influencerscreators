import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AdminPage, Panel, StatCard } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { coproducerGetOverviewFn, coproducerListPromptsFn } from "@/lib/coproducer.functions";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/bergamo")({ component: BergamoAdminPage });

function BergamoAdminPage() {
  const getOverview = useServerFn(coproducerGetOverviewFn);
  const listPrompts = useServerFn(coproducerListPromptsFn);
  const overview = useQuery({
    queryKey: ["admin", "bergamo", "overview"],
    queryFn: () => getOverview(),
  });
  const prompts = useQuery({
    queryKey: ["admin", "bergamo", "prompts"],
    queryFn: () => listPrompts(),
  });
  const items = prompts.data ?? [];
  const published = items.filter((item) => item.status === "published").length;
  const drafts = items.filter((item) => item.status === "draft").length;
  const archived = items.filter((item) => item.status === "archived").length;

  return (
    <AdminPage
      title="Bergamo"
      description="Operação do produto: conteúdo, clientes e vendas. Integração e preço continuam exclusivos do super_admin."
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/coprodutor/bergamo">Abrir workspace operacional</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/integracoes">Integração Hotmart</Link>
          </Button>
        </>
      }
    >
      {overview.isLoading || prompts.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando dados do Bergamo...</p>
      ) : null}
      {overview.error || prompts.error ? (
        <p className="text-sm text-destructive">Não foi possível carregar o painel do Bergamo.</p>
      ) : null}
      {overview.data && !prompts.isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Prompts"
              value={String(items.length)}
              hint={`${published} publicados`}
            />
            <StatCard label="Rascunhos" value={String(drafts)} hint={`${archived} arquivados`} />
            <StatCard label="Compradores ativos" value={String(overview.data.activeCustomers)} />
            <StatCard
              label="Vendas aprovadas"
              value={String(overview.data.approvedSales)}
              hint={brl(overview.data.grossRevenueCents)}
            />
          </div>
          <Panel
            title="Status comercial"
            description="Dados de venda só de Bergamo; nenhum payload de webhook ou segredo é exibido."
          >
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <p>
                Preço atual: <strong>{brl(overview.data.priceCents)}</strong>
              </p>
              <p>
                Produto: <strong>{overview.data.productStatus}</strong>
              </p>
              <p>
                Pedidos pendentes: <strong>{overview.data.pendingOrders}</strong>
              </p>
            </div>
          </Panel>
          <Panel
            title="Operação de conteúdo"
            description="O workspace operacional usa server functions autorizadas e mantém histórico de revisão; não há escrita direta do navegador."
          >
            <Button asChild>
              <Link to="/coprodutor/bergamo">Gerenciar prompts, atualizações e clientes</Link>
            </Button>
          </Panel>
        </>
      ) : null}
    </AdminPage>
  );
}
