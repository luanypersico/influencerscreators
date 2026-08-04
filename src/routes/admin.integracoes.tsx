import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminPage, Panel } from "@/components/admin/AdminPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  adminGetBergamoIntegrationFn,
  adminListBergamoWebhookEventsFn,
  adminUpdateBergamoIntegrationFn,
} from "@/lib/admin-integrations.functions";

export const Route = createFileRoute("/admin/integracoes")({
  component: IntegrationsPage,
});

type Form = {
  external_product_ucode: string;
  external_product_id: string;
  external_offer_id: string;
  environment: "test" | "production";
  active: boolean;
};

const EMPTY: Form = {
  external_product_ucode: "",
  external_product_id: "",
  external_offer_id: "",
  environment: "production",
  active: false,
};

function IntegrationsPage() {
  const qc = useQueryClient();
  const getIntegration = useServerFn(adminGetBergamoIntegrationFn);
  const listEvents = useServerFn(adminListBergamoWebhookEventsFn);
  const updateIntegration = useServerFn(adminUpdateBergamoIntegrationFn);

  const [form, setForm] = useState<Form>(EMPTY);

  const { data: integration, isLoading } = useQuery({
    queryKey: ["admin", "integracoes", "hotmart"],
    queryFn: () => getIntegration(),
  });

  const { data: events } = useQuery({
    queryKey: ["admin", "integracoes", "eventos"],
    queryFn: () => listEvents(),
  });

  useEffect(() => {
    if (!integration) return;
    setForm({
      external_product_ucode: integration.external_product_ucode ?? "",
      external_product_id: integration.external_product_id ?? "",
      external_offer_id: integration.external_offer_id ?? "",
      environment: integration.environment === "test" ? "test" : "production",
      active: integration.active,
    });
  }, [integration]);

  const missing = !form.external_product_ucode.trim() || !form.external_offer_id.trim();

  async function save(nextActive: boolean) {
    try {
      await updateIntegration({
        data: {
          external_product_ucode: form.external_product_ucode.trim() || null,
          external_product_id: form.external_product_id.trim() || null,
          external_offer_id: form.external_offer_id.trim() || null,
          environment: form.environment,
          active: nextActive,
        },
      });
      toast.success(
        nextActive ? "Integração ativa. A Hotmart já pode liberar acessos." : "Dados salvos.",
      );
      await qc.invalidateQueries({ queryKey: ["admin", "integracoes", "hotmart"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <AdminPage
      title="Integrações"
      description="Conexão de pagamento e liberação automática de acesso. Hoje: Hotmart para o produto Bergamo."
    >
      <Panel
        title="Endpoint do webhook"
        description="Cole esta URL na Hotmart em Ferramentas → Webhook (API e Notificações), versão 2.0."
      >
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
            {integration?.webhook_url ?? "carregando..."}
          </code>
          <Button
            size="sm"
            variant="outline"
            disabled={!integration?.webhook_url}
            onClick={async () => {
              if (!integration?.webhook_url) return;
              await navigator.clipboard.writeText(integration.webhook_url);
              toast.success("URL copiada.");
            }}
          >
            Copiar
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Eventos a marcar: Compra aprovada, Compra completa, Boleto impresso, Compra atrasada,
          Compra expirada, Compra cancelada, Reembolso, Chargeback e Protesto.
        </p>
      </Panel>

      <Panel
        title="Hotmart · Bergamo"
        description="O Hottok fica guardado nos Secrets do ambiente e nunca é exibido nesta página."
      >
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && !integration && (
          <p className="text-sm text-muted-foreground">Nenhuma integração cadastrada.</p>
        )}

        {integration && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant={form.active ? "default" : "secondary"}>
                {form.active ? "Ativa" : "Inativa"}
              </Badge>
              <Badge variant="outline">produto: bergamo</Badge>
              <Badge variant={integration.hottok_configured ? "default" : "secondary"}>
                {integration.hottok_configured
                  ? "Hottok configurado no ambiente"
                  : "Hottok ainda não configurado"}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">ucode do produto (Hotmart)</Label>
                <Input
                  value={form.external_product_ucode}
                  placeholder="ex.: 1a2b3c4d-...."
                  onChange={(e) => setForm({ ...form, external_product_ucode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Código da oferta</Label>
                <Input
                  value={form.external_offer_id}
                  placeholder="ex.: abc12def"
                  onChange={(e) => setForm({ ...form, external_offer_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  ID numérico do produto (opcional)
                </Label>
                <Input
                  value={form.external_product_id}
                  onChange={(e) => setForm({ ...form, external_product_id: e.target.value })}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              O Hottok é cadastrado nos Secrets do ambiente (HOTMART_HOTTOK) e nunca é exibido nesta
              página.
            </p>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <Switch checked={form.active} onCheckedChange={(v) => save(v)} />
                <span className="text-sm">Integração ativa</span>
              </div>
              <Button size="sm" onClick={() => save(form.active)}>
                Salvar dados
              </Button>
              {missing && (
                <span className="text-xs text-muted-foreground">
                  Faltam dados obrigatórios para ativar (ucode e oferta), além do Hottok no
                  ambiente.
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <p>O checkout é editado em Produtos — aqui só cuidamos da conexão do webhook.</p>
            </div>
          </div>
        )}
      </Panel>

      <Panel
        title="Últimos eventos recebidos"
        description="Registro técnico do webhook (somente produto Bergamo)."
      >
        {!events?.length && (
          <p className="text-sm text-muted-foreground">Nenhum evento recebido ainda.</p>
        )}
        {!!events?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Quando</th>
                  <th className="py-2 pr-4 font-medium">Evento</th>
                  <th className="py-2 pr-4 font-medium">Transação</th>
                  <th className="py-2 pr-4 font-medium">Situação</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-t border-border">
                    <td className="py-2 pr-4">{new Date(ev.created_at).toLocaleString("pt-BR")}</td>
                    <td className="py-2 pr-4">{ev.event_type}</td>
                    <td className="py-2 pr-4">{ev.transaction_ref ?? "—"}</td>
                    <td className="py-2 pr-4">{ev.processing_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AdminPage>
  );
}
