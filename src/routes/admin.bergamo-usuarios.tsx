import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage, Panel } from "@/components/admin/AdminPage";
import { ProvisionValidationAccountDialog } from "@/components/admin/ProvisionValidationAccountDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRoles, useSession } from "@/hooks/useAuth";
import {
  adminDeleteHotmartValidationUserFn,
  adminLinkBergamoCoproducerFn,
  adminListBergamoCoproducersFn,
  adminListHotmartValidationAccountsFn,
  adminRevokeBergamoCoproducerFn,
  adminRevokeHotmartValidationAccessFn,
  adminSetBergamoCoproducerMemberPreviewFn,
} from "@/lib/bergamo-operational-access.functions";
import { dateBR } from "@/lib/format";

export const Route = createFileRoute("/admin/bergamo-usuarios")({
  component: BergamoUsersPage,
});

function BergamoUsersPage() {
  const qc = useQueryClient();
  const { user } = useSession();
  const { isSuperAdmin, loading: rolesLoading } = useRoles(user?.id);

  const listValidation = useServerFn(adminListHotmartValidationAccountsFn);
  const revokeValidation = useServerFn(adminRevokeHotmartValidationAccessFn);
  const deleteValidation = useServerFn(adminDeleteHotmartValidationUserFn);
  const listCoproducers = useServerFn(adminListBergamoCoproducersFn);
  const linkCoproducer = useServerFn(adminLinkBergamoCoproducerFn);
  const revokeCoproducer = useServerFn(adminRevokeBergamoCoproducerFn);
  const setPreview = useServerFn(adminSetBergamoCoproducerMemberPreviewFn);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [coproducerEmail, setCoproducerEmail] = useState("");

  const validationQuery = useQuery({
    queryKey: ["admin", "bergamo", "validation-accounts"],
    queryFn: () => listValidation(),
    enabled: isSuperAdmin,
  });

  const coproducersQuery = useQuery({
    queryKey: ["admin", "bergamo", "coproducers"],
    queryFn: () => listCoproducers(),
    enabled: isSuperAdmin,
  });

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      toast.success(success);
      await qc.invalidateQueries({ queryKey: ["admin", "bergamo"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ação não permitida.");
    }
  }

  if (rolesLoading) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  if (!isSuperAdmin) {
    return (
      <AdminPage title="Usuários do Bergamo" description="Acesso restrito ao super admin.">
        <Panel title="Acesso restrito">
          <p className="text-sm text-muted-foreground">
            Somente o super admin pode provisionar a conta de validação da Hotmart ou vincular o
            coprodutor do Bergamo.
          </p>
        </Panel>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Usuários do Bergamo"
      description="Conta exclusiva de validação da Hotmart e vínculo do coprodutor real — nenhuma ação aqui ativa checkout, webhook ou integração."
    >
      <Panel
        title="A. Conta de validação Hotmart"
        description="Usada só para a Hotmart validar login e senha. Nunca recebe papel administrativo nem vínculo de coprodutor. A senha nunca é reexibida."
      >
        <div className="mb-4">
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            Provisionar conta de validação
          </Button>
        </div>

        {validationQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}
        {!validationQuery.isLoading && (validationQuery.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma conta de validação provisionada.</p>
        )}

        <div className="space-y-2">
          {(validationQuery.data ?? []).map((row) => (
            <div
              key={row.userId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{row.label ?? row.email}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.email} · criada {dateBR(row.createdAt)} · expira {dateBR(row.expiresAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={row.active ? "default" : "secondary"}>
                  {row.active ? "Acesso ativo" : "Acesso revogado"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!row.active}
                  onClick={() =>
                    run(
                      () => revokeValidation({ data: { userId: row.userId } }),
                      "Acesso de validação revogado.",
                    )
                  }
                >
                  Revogar acesso
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (
                      !confirm(
                        `Excluir definitivamente a conta de validação ${row.email} do Auth? Esta ação é separada da revogação de acesso e não pode ser desfeita.`,
                      )
                    )
                      return;
                    run(
                      () =>
                        deleteValidation({
                          data: { userId: row.userId, confirmDeleteAuthUser: true },
                        }),
                      "Conta de validação excluída do Auth.",
                    );
                  }}
                >
                  Excluir conta
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="B. Coprodutor"
        description="Vínculo escopado só ao Bergamo (product_collaborators). Nunca cria admin ou super_admin. A pré-visualização da área de membros é uma permissão separada, nunca automática."
      >
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">E-mail do coprodutor</label>
            <Input
              type="email"
              value={coproducerEmail}
              onChange={(e) => setCoproducerEmail(e.target.value)}
              placeholder="coprodutor@dominio.com"
              className="w-64"
            />
          </div>
          <Button
            size="sm"
            disabled={!coproducerEmail.trim()}
            onClick={() =>
              run(async () => {
                await linkCoproducer({ data: { email: coproducerEmail } });
                setCoproducerEmail("");
              }, "Coprodutor vinculado.")
            }
          >
            Vincular coprodutor
          </Button>
        </div>

        {coproducersQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}
        {!coproducersQuery.isLoading && (coproducersQuery.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum coprodutor vinculado ainda.</p>
        )}

        <div className="space-y-2">
          {(coproducersQuery.data ?? []).map((row) => (
            <div
              key={row.userId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{row.email}</p>
                <p className="truncate text-xs text-muted-foreground">
                  vinculado {dateBR(row.linkedAt)}
                  {row.revokedAt ? ` · revogado ${dateBR(row.revokedAt)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={row.status === "active" ? "default" : "secondary"}>
                  {row.status === "active" ? "Vínculo ativo" : "Vínculo revogado"}
                </Badge>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Pré-visualizar área de membros</span>
                  <Switch
                    checked={row.memberPreviewActive}
                    disabled={row.status !== "active"}
                    onCheckedChange={(v) =>
                      run(
                        () => setPreview({ data: { userId: row.userId, enabled: v } }),
                        v ? "Pré-visualização concedida." : "Pré-visualização revogada.",
                      )
                    }
                  />
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={row.status !== "active"}
                  onClick={() =>
                    run(
                      () => revokeCoproducer({ data: { userId: row.userId } }),
                      "Vínculo de coprodutor revogado.",
                    )
                  }
                >
                  Revogar vínculo
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <ProvisionValidationAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProvisioned={() =>
          qc.invalidateQueries({ queryKey: ["admin", "bergamo", "validation-accounts"] })
        }
      />
    </AdminPage>
  );
}
