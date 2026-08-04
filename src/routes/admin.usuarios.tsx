import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPage, Panel } from "@/components/admin/AdminPage";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRoles, useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  adminDeleteUserFn,
  adminListUsersFn,
  adminSetAccessFn,
  adminSetPasswordFn,
  adminSetRoleFn,
} from "@/lib/admin.functions";
import { dateBR } from "@/lib/format";

export const Route = createFileRoute("/admin/usuarios")({
  component: UsersPage,
});

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  coproducer: "Co-produtor",
  support: "Suporte",
  member: "Cliente",
};

function UsersPage() {
  const qc = useQueryClient();
  const { user } = useSession();
  const { isSuperAdmin } = useRoles(user?.id);
  const listUsers = useServerFn(adminListUsersFn);
  const setRole = useServerFn(adminSetRoleFn);
  const setAccess = useServerFn(adminSetAccessFn);
  const setPassword = useServerFn(adminSetPasswordFn);
  const deleteUser = useServerFn(adminDeleteUserFn);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => listUsers({ data: { search } }),
  });

  const { data: products } = useQuery({
    queryKey: ["admin", "products", "options"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin", "users"] });
  }

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      toast.success(success);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ação não permitida.");
    }
  }

  return (
    <AdminPage
      title="Usuários & acessos"
      description="Crie contas manualmente, defina papéis, libere ou revogue produtos e redefina senhas."
      actions={<Button onClick={() => setDialogOpen(true)}>Adicionar usuário</Button>}
    >
      <Panel title="Base de usuários">
        <Input
          placeholder="Buscar por e-mail ou nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>}

        <div className="mt-4 space-y-2">
          {(users ?? []).map((u) => (
            <div key={u.id} className="rounded-xl border border-border">
              <button
                className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
                onClick={() => setExpanded(expanded === u.id ? null : u.id)}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{u.full_name || u.email}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email} · entrou {dateBR(u.last_sign_in_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {u.roles.map((r) => (
                    <span key={r} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                      {ROLE_LABEL[r] ?? r}
                    </span>
                  ))}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {u.products.length} produto(s)
                  </span>
                </div>
              </button>

              {expanded === u.id && (
                <div className="space-y-4 border-t border-border/60 p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Papéis</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {Object.keys(ROLE_LABEL).map((role) => (
                        <label key={role} className="flex items-center justify-between gap-2 text-sm">
                          <span>{ROLE_LABEL[role]}</span>
                          <Switch
                            disabled={!isSuperAdmin}
                            checked={u.roles.includes(role as "member")}
                            onCheckedChange={(v) =>
                              run(
                                () => setRole({ data: { userId: u.id, role: role as "member", enabled: v } }),
                                "Papel atualizado.",
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Acesso a produtos
                    </p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {(products ?? []).map((p) => (
                        <label key={p.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="min-w-0 truncate">{p.name}</span>
                          <Switch
                            checked={u.products.some((up) => up.product_id === p.id && !up.revoked_at)}
                            onCheckedChange={(v) =>
                              run(
                                () => setAccess({ data: { userId: u.id, productId: p.id, enabled: v } }),
                                v ? "Acesso liberado." : "Acesso revogado.",
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!isSuperAdmin}
                      onClick={() => {
                        const password = prompt("Nova senha (mínimo 8 caracteres):");
                        if (!password) return;
                        run(
                          () => setPassword({ data: { userId: u.id, password } }),
                          "Senha redefinida.",
                        );
                      }}
                    >
                      Definir senha
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        run(async () => {
                          const next = u.status === "active" ? "blocked" : "active";
                          const { error } = await supabase
                            .from("profiles")
                            .update({ status: next })
                            .eq("id", u.id);
                          if (error) throw error;
                        }, "Status atualizado.")
                      }
                    >
                      {u.status === "active" ? "Bloquear" : "Desbloquear"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      disabled={!isSuperAdmin || u.id === user?.id}
                      onClick={() => {
                        if (!confirm(`Excluir definitivamente ${u.email}?`)) return;
                        run(() => deleteUser({ data: { userId: u.id } }), "Usuário excluído.");
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {users?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>}
        </div>
      </Panel>

      <CreateUserDialog
        open={dialogOpen}
        products={products ?? []}
        canManageAdmins={isSuperAdmin}
        onOpenChange={setDialogOpen}
        onCreated={refresh}
      />
    </AdminPage>
  );
}