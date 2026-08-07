import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage, Panel } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { adminPreviewAudienceFn, adminSendEmailFn } from "@/lib/admin.functions";
import { dateBR } from "@/lib/format";

export const Route = createFileRoute("/admin/emails")({
  component: EmailsPage,
});

type Audience = "all" | "buyers" | "leads" | "product" | "manual";

function EmailsPage() {
  const qc = useQueryClient();
  const sendEmail = useServerFn(adminSendEmailFn);
  const previewAudience = useServerFn(adminPreviewAudienceFn);

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [audience, setAudience] = useState<Audience>("buyers");
  const [productId, setProductId] = useState("");
  const [manual, setManual] = useState("");

  const { data: products } = useQuery({
    queryKey: ["admin", "products", "options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["admin", "email_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const manualList = manual
    .split(/[\n,;]/)
    .map((v) => v.trim())
    .filter(Boolean);

  const preview = useMutation({
    mutationFn: () =>
      previewAudience({ data: { audience, productId: productId || null, manual: manualList } }),
    onSuccess: (res) =>
      toast.info(`${res.count} destinatário(s). Ex.: ${res.sample.join(", ") || "—"}`, {
        duration: 8000,
      }),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erro."),
  });

  const send = useMutation({
    mutationFn: async () => {
      const { data: campaign, error } = await supabase
        .from("email_campaigns")
        .insert({
          name: subject.slice(0, 60) || "Campanha",
          subject,
          body_html: html,
          audience,
          product_id: productId || null,
          manual_recipients: manualList,
          status: "sending",
        })
        .select("id")
        .single();
      if (error) throw error;

      return sendEmail({
        data: {
          subject,
          html,
          audience,
          productId: productId || null,
          manual: manualList,
          campaignId: campaign.id,
        },
      });
    },
    onSuccess: async (res) => {
      toast.success(`Enviados: ${res.sent} · Falhas: ${res.failed}`);
      if (res.errors.length) toast.error(res.errors.slice(0, 3).join(" | "));
      await qc.invalidateQueries({ queryKey: ["admin", "email_messages"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao enviar."),
  });

  return (
    <AdminPage
      title="E-mails"
      description="Escreva e dispare comunicações para clientes, compradores de um produto específico ou leads."
    >
      <Panel title="Nova comunicação">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Assunto</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Público</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
            >
              <option value="all">Todos os usuários</option>
              <option value="buyers">Compradores (com acesso)</option>
              <option value="product">Compradores de um produto</option>
              <option value="leads">Leads</option>
              <option value="manual">Lista manual</option>
            </select>
          </div>

          {audience === "product" && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Produto</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Selecione</option>
                {(products ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {audience === "manual" && (
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">
                E-mails (separe por vírgula ou linha)
              </Label>
              <Textarea rows={3} value={manual} onChange={(e) => setManual(e.target.value)} />
            </div>
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Conteúdo (HTML permitido)</Label>
            <Textarea rows={10} value={html} onChange={(e) => setHtml(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => preview.mutate()}
            disabled={preview.isPending}
          >
            Ver destinatários
          </Button>
          <Button size="sm" onClick={() => send.mutate()} disabled={send.isPending}>
            {send.isPending ? "Enviando..." : "Enviar agora"}
          </Button>
        </div>
      </Panel>

      <Panel title="Histórico de envios">
        <div className="space-y-1 text-sm">
          {(messages ?? []).map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2"
            >
              <span className="min-w-0 truncate">
                {m.to_email} — {m.subject}
              </span>
              <span className="text-xs text-muted-foreground">
                {m.status} · {dateBR(m.created_at)}
                {m.error ? ` · ${m.error}` : ""}
              </span>
            </div>
          ))}
          {messages?.length === 0 && (
            <p className="text-muted-foreground">Nenhum e-mail enviado ainda.</p>
          )}
        </div>
      </Panel>
    </AdminPage>
  );
}
