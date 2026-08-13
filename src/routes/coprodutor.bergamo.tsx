import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminPage, Panel, StatCard } from "@/components/admin/AdminPage";
import { ArsenalLogo } from "@/components/brand/ArsenalLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import {
  coproducerCreatePromptFn,
  coproducerCreateUpdateFn,
  coproducerGetOverviewFn,
  coproducerGrantCourtesyAccessFn,
  coproducerListCustomersFn,
  coproducerListPromptRevisionsFn,
  coproducerListPromptsFn,
  coproducerListUpdatesFn,
  coproducerReorderPromptsFn,
  coproducerRevokeCourtesyAccessFn,
  coproducerSetPromptStatusFn,
  coproducerSetUpdateStatusFn,
  coproducerUpdatePromptFn,
  coproducerUpdateUpdateFn,
} from "@/lib/coproducer.functions";
import type {
  CoproducerPromptRow,
  CoproducerUpdateRow,
  PromptRevisionRow,
} from "@/lib/coproducer.server";
import { brl, dateBR } from "@/lib/format";

export const Route = createFileRoute("/coprodutor/bergamo")({
  head: () => ({
    meta: [
      { title: "Workspace Bergamo — Coprodutor" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CoproducerBergamoPage,
});

function CenteredNote({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <ArsenalLogo className="mx-auto mb-6 w-36" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function CoproducerBergamoPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const { logout, isSigningOut } = useLogout();
  const getOverview = useServerFn(coproducerGetOverviewFn);

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível sair da conta.");
    }
  }

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  const {
    data: overview,
    isLoading: overviewLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["coproducer", "bergamo", "overview"],
    queryFn: () => getOverview(),
    enabled: Boolean(session),
    retry: false,
  });

  if (loading || (session && overviewLoading)) {
    return <CenteredNote title="Carregando workspace..." />;
  }
  if (!session) {
    return <CenteredNote title="Redirecionando para o login..." />;
  }
  if (isError) {
    return (
      <CenteredNote
        title="Acesso restrito"
        description={
          error instanceof Error ? error.message : "Você não tem acesso a este workspace."
        }
      />
    );
  }
  if (!overview) {
    return <CenteredNote title="Carregando workspace..." />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <div className="mb-8 border-b border-border pb-5">
          <Link
            to="/"
            className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArsenalLogo className="w-28 sm:w-36" />
          </Link>
        </div>
        <AdminPage
          title="Workspace Bergamo"
          description="Vendas, clientes e conteúdo do produto Bergamo. Preço e checkout são administrados só pelo super_admin."
          actions={
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={isSigningOut}
              onClick={() => void handleLogout()}
            >
              {isSigningOut ? "Saindo..." : "Sair"}
            </Button>
          }
        >
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Visão geral</TabsTrigger>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="updates">Atualizações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <OverviewTab
                approvedSales={overview.approvedSales}
                pendingOrders={overview.pendingOrders}
                refunds={overview.refunds}
                disputes={overview.disputes}
                activeCustomers={overview.activeCustomers}
                grossRevenueCents={overview.grossRevenueCents}
                priceCents={overview.priceCents}
                currency={overview.currency}
                productStatus={overview.productStatus}
              />
            </TabsContent>

            <TabsContent value="customers" className="mt-6">
              <CustomersTab />
            </TabsContent>

            <TabsContent value="prompts" className="mt-6">
              <PromptsTab />
            </TabsContent>

            <TabsContent value="updates" className="mt-6">
              <UpdatesTab />
            </TabsContent>
          </Tabs>
        </AdminPage>
      </div>
    </div>
  );
}

function OverviewTab(props: {
  approvedSales: number;
  pendingOrders: number;
  refunds: number;
  disputes: number;
  activeCustomers: number;
  grossRevenueCents: number;
  priceCents: number;
  currency: string;
  productStatus: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Vendas aprovadas" value={String(props.approvedSales)} />
        <StatCard label="Pedidos pendentes" value={String(props.pendingOrders)} />
        <StatCard label="Reembolsos" value={String(props.refunds)} />
        <StatCard label="Disputas" value={String(props.disputes)} />
        <StatCard label="Clientes ativos" value={String(props.activeCustomers)} />
        <StatCard label="Faturamento bruto registrado" value={brl(props.grossRevenueCents)} />
      </div>

      <Panel
        title="Preço atual (somente leitura)"
        description="Taxas e divisão financeira são administradas pela Hotmart. Preço, checkout e status do produto só são alterados pelo super_admin."
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl font-semibold text-foreground">{brl(props.priceCents)}</span>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground uppercase">
            {props.productStatus === "active" ? "publicado" : "em rascunho"}
          </span>
        </div>
      </Panel>
    </div>
  );
}

function CustomersTab() {
  const qc = useQueryClient();
  const getCustomers = useServerFn(coproducerListCustomersFn);
  const grantCourtesy = useServerFn(coproducerGrantCourtesyAccessFn);
  const revokeCourtesy = useServerFn(coproducerRevokeCourtesyAccessFn);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [revokingUserId, setRevokingUserId] = useState<string | null>(null);
  const { data: customers, isLoading } = useQuery({
    queryKey: ["coproducer", "bergamo", "customers"],
    queryFn: () => getCustomers(),
  });

  const ACCESS_LABEL: Record<string, string> = {
    active: "Ativo",
    suspended: "Suspenso",
    revoked: "Revogado",
    none: "Sem acesso",
  };

  async function submitCourtesyAccess() {
    setSubmitting(true);
    try {
      const result = await grantCourtesy({ data: { name, email, note } });
      const message = result.invited
        ? "Convite enviado e acesso cortesia concedido."
        : result.access === "already_has_access" || result.access === "already_active"
          ? "Este usuário já possui acesso ao Bergamo."
          : result.access === "restored"
            ? "Acesso cortesia restaurado."
            : "Acesso cortesia concedido.";
      toast.success(message);
      setDialogOpen(false);
      setName("");
      setEmail("");
      setNote("");
      await qc.invalidateQueries({ queryKey: ["coproducer", "bergamo"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível conceder o acesso.");
    } finally {
      setSubmitting(false);
    }
  }

  async function revokeCourtesyAccess(userId: string) {
    setRevokingUserId(userId);
    try {
      await revokeCourtesy({ data: { userId } });
      toast.success("Acesso cortesia revogado.");
      await qc.invalidateQueries({ queryKey: ["coproducer", "bergamo"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível revogar o acesso.");
    } finally {
      setRevokingUserId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          + Adicionar cliente
        </Button>
      </div>

      <Panel
        title="Clientes do Bergamo"
        description="Compras e acessos cortesia deste produto. Cortesias não criam pedidos nem entram no faturamento."
      >
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && (!customers || customers.length === 0) && (
          <p className="text-sm text-muted-foreground">Nenhum cliente ainda.</p>
        )}
        {!!customers?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Nome</th>
                  <th className="py-2 pr-4 font-medium">E-mail</th>
                  <th className="py-2 pr-4 font-medium">Origem</th>
                  <th className="py-2 pr-4 font-medium">Status do acesso</th>
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={`${customer.origin}:${customer.userId ?? customer.email}`}
                    className="border-t border-border"
                  >
                    <td className="py-2 pr-4">{customer.name ?? "—"}</td>
                    <td className="py-2 pr-4">{customer.email}</td>
                    <td className="py-2 pr-4">
                      {customer.origin === "manual" ? "Cortesia / Manual" : "Compra"}
                    </td>
                    <td className="py-2 pr-4">
                      {ACCESS_LABEL[customer.accessStatus] ?? customer.accessStatus}
                    </td>
                    <td className="py-2 pr-4">{dateBR(customer.grantedAt)}</td>
                    <td className="py-2">
                      {customer.canRevokeCourtesy && customer.userId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={revokingUserId === customer.userId}
                          onClick={() => void revokeCourtesyAccess(customer.userId!)}
                        >
                          {revokingUserId === customer.userId ? "Revogando..." : "Revogar cortesia"}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar cliente</DialogTitle>
            <DialogDescription>
              Concede acesso cortesia ao Bergamo sem criar venda, pedido ou faturamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="courtesy-name">Nome</Label>
              <Input
                id="courtesy-name"
                value={name}
                maxLength={120}
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="courtesy-email">E-mail</Label>
              <Input
                id="courtesy-email"
                type="email"
                value={email}
                maxLength={254}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="courtesy-note">Observação (opcional)</Label>
              <Textarea
                id="courtesy-note"
                value={note}
                maxLength={500}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            <Button
              className="w-full"
              disabled={submitting || !name.trim() || !email.trim()}
              onClick={() => void submitCourtesyAccess()}
            >
              {submitting ? "Concedendo..." : "Conceder acesso cortesia"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PromptEditorDialog({
  item,
  onOpenChange,
}: {
  item: CoproducerPromptRow | "new" | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const create = useServerFn(coproducerCreatePromptFn);
  const update = useServerFn(coproducerUpdatePromptFn);

  const editing = item !== "new" ? item : null;
  const [code, setCode] = useState(editing?.code ?? "");
  const [isFree, setIsFree] = useState(editing?.isFree ?? false);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [category, setCategory] = useState(editing?.category ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [prompt, setPrompt] = useState(editing?.prompt ?? "");

  useEffect(() => {
    setCode(editing?.code ?? "");
    setIsFree(editing?.isFree ?? false);
    setTitle(editing?.title ?? "");
    setCategory(editing?.category ?? "");
    setDescription(editing?.description ?? "");
    setPrompt(editing?.prompt ?? "");
  }, [editing]);

  async function save() {
    try {
      if (item === "new") {
        await create({ data: { code, isFree, title, category, description, prompt } });
        toast.success("Prompt criado como rascunho.");
      } else if (item) {
        await update({
          data: { itemId: item.id, code, isFree, title, category, description, prompt },
        });
        toast.success("Prompt atualizado.");
      }
      await qc.invalidateQueries({ queryKey: ["coproducer", "bergamo", "prompts"] });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item === "new" ? "Novo prompt" : "Editar prompt"}</DialogTitle>
          <DialogDescription>
            Salva como rascunho. Publique quando estiver pronto.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prompt-code">Código</Label>
              <Input id="prompt-code" value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />{" "}
              Gratuito
            </label>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prompt-title">Título</Label>
            <Input id="prompt-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prompt-category">Categoria</Label>
            <Input
              id="prompt-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prompt-description">Descrição curta</Label>
            <Input
              id="prompt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prompt-text">Prompt completo</Label>
            <Textarea
              id="prompt-text"
              rows={8}
              className="font-mono text-xs"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={save}>Salvar</Button>
      </DialogContent>
    </Dialog>
  );
}

function RevisionsDialog({
  itemId,
  onOpenChange,
}: {
  itemId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const getRevisions = useServerFn(coproducerListPromptRevisionsFn);
  const { data: revisions } = useQuery<PromptRevisionRow[]>({
    queryKey: ["coproducer", "bergamo", "prompt-revisions", itemId],
    queryFn: () => getRevisions({ data: { itemId: itemId! } }),
    enabled: Boolean(itemId),
  });

  return (
    <Dialog open={itemId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico de revisões</DialogTitle>
          <DialogDescription>
            Toda edição, publicação e arquivamento fica registrado aqui.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {!revisions?.length && (
            <p className="text-sm text-muted-foreground">Sem revisões ainda.</p>
          )}
          {revisions?.map((rev) => (
            <div key={rev.version} className="rounded-lg border border-border p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  v{rev.version} · {rev.status}
                </span>
                <span className="text-muted-foreground">{dateBR(rev.createdAt)}</span>
              </div>
              <p className="mt-1 text-muted-foreground">{rev.title}</p>
              {rev.reason && <p className="mt-1 text-muted-foreground">Motivo: {rev.reason}</p>}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PromptsTab() {
  const qc = useQueryClient();
  const getPrompts = useServerFn(coproducerListPromptsFn);
  const setStatus = useServerFn(coproducerSetPromptStatusFn);
  const reorder = useServerFn(coproducerReorderPromptsFn);

  const [editorItem, setEditorItem] = useState<CoproducerPromptRow | "new" | null>(null);
  const [revisionsItemId, setRevisionsItemId] = useState<string | null>(null);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["coproducer", "bergamo", "prompts"],
    queryFn: () => getPrompts(),
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["coproducer", "bergamo", "prompts"] });
  }

  async function changeStatus(itemId: string, status: "draft" | "published" | "archived") {
    try {
      await setStatus({ data: { itemId, status } });
      toast.success("Status atualizado.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!prompts) return;
    const target = index + direction;
    if (target < 0 || target >= prompts.length) return;
    const ids = prompts.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    try {
      await reorder({ data: { orderedIds: ids } });
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível reordenar.");
    }
  }

  return (
    <Panel
      title="Prompts do Bergamo"
      description="Criar, editar, publicar e arquivar. Nada é excluído permanentemente."
    >
      <div className="mb-4">
        <Button size="sm" onClick={() => setEditorItem("new")}>
          Novo prompt
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <div className="space-y-2">
        {prompts?.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {item.title} <span className="text-xs text-muted-foreground">#{item.code}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {item.category} · {item.status} · posição {item.sortOrder} ·{" "}
                {item.isFree ? "gratuito" : "bloqueado"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => move(index, 1)}
                disabled={index === prompts.length - 1}
              >
                ↓
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditorItem(item)}>
                Editar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRevisionsItemId(item.id)}>
                Histórico
              </Button>
              {item.status !== "published" && (
                <Button size="sm" onClick={() => changeStatus(item.id, "published")}>
                  Publicar
                </Button>
              )}
              {item.status !== "archived" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => changeStatus(item.id, "archived")}
                >
                  Arquivar
                </Button>
              )}
              {item.status === "archived" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => changeStatus(item.id, "draft")}
                >
                  Reabrir como rascunho
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <PromptEditorDialog item={editorItem} onOpenChange={(open) => !open && setEditorItem(null)} />
      <RevisionsDialog
        itemId={revisionsItemId}
        onOpenChange={(open) => !open && setRevisionsItemId(null)}
      />
    </Panel>
  );
}

function UpdateEditorDialog({
  item,
  onOpenChange,
}: {
  item: CoproducerUpdateRow | "new" | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const create = useServerFn(coproducerCreateUpdateFn);
  const update = useServerFn(coproducerUpdateUpdateFn);

  const editing = item !== "new" ? item : null;
  const [title, setTitle] = useState(editing?.title ?? "");
  const [content, setContent] = useState(editing?.content ?? "");

  useEffect(() => {
    setTitle(editing?.title ?? "");
    setContent(editing?.content ?? "");
  }, [editing]);

  async function save() {
    try {
      if (item === "new") {
        await create({ data: { title, content } });
        toast.success("Atualização criada como rascunho.");
      } else if (item) {
        await update({ data: { updateId: item.id, title, content } });
        toast.success("Atualização salva.");
      }
      await qc.invalidateQueries({ queryKey: ["coproducer", "bergamo", "updates"] });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item === "new" ? "Nova atualização" : "Editar atualização"}</DialogTitle>
          <DialogDescription>
            Atualizações publicadas aparecem para os membros em /membros/bergamo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="update-title">Título</Label>
            <Input id="update-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="update-content">Conteúdo</Label>
            <Textarea
              id="update-content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={save}>Salvar</Button>
      </DialogContent>
    </Dialog>
  );
}

function UpdatesTab() {
  const qc = useQueryClient();
  const getUpdates = useServerFn(coproducerListUpdatesFn);
  const setStatus = useServerFn(coproducerSetUpdateStatusFn);
  const [editorItem, setEditorItem] = useState<CoproducerUpdateRow | "new" | null>(null);

  const { data: updates, isLoading } = useQuery({
    queryKey: ["coproducer", "bergamo", "updates"],
    queryFn: () => getUpdates(),
  });

  async function changeStatus(updateId: string, status: "draft" | "published" | "archived") {
    try {
      await setStatus({ data: { updateId, status } });
      toast.success("Status atualizado.");
      await qc.invalidateQueries({ queryKey: ["coproducer", "bergamo", "updates"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  }

  return (
    <Panel title="Atualizações do Bergamo" description="Publicadas aparecem para os membros.">
      <div className="mb-4">
        <Button size="sm" onClick={() => setEditorItem("new")}>
          Nova atualização
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <div className="space-y-2">
        {updates?.map((update) => (
          <div key={update.id} className="rounded-xl border border-border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-foreground">{update.title}</p>
              <span className="text-xs text-muted-foreground uppercase">{update.status}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{update.content}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" onClick={() => setEditorItem(update)}>
                Editar
              </Button>
              {update.status !== "published" && (
                <Button size="sm" onClick={() => changeStatus(update.id, "published")}>
                  Publicar
                </Button>
              )}
              {update.status !== "archived" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => changeStatus(update.id, "archived")}
                >
                  Arquivar
                </Button>
              )}
            </div>
          </div>
        ))}
        {!isLoading && !updates?.length && (
          <p className="text-sm text-muted-foreground">Nenhuma atualização ainda.</p>
        )}
      </div>

      <UpdateEditorDialog item={editorItem} onOpenChange={(open) => !open && setEditorItem(null)} />
    </Panel>
  );
}
