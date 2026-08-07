import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AdminPage, Panel } from "@/components/admin/AdminPage";
import { supabase } from "@/integrations/supabase/client";
import { dateBR } from "@/lib/format";

export const Route = createFileRoute("/admin/auditoria")({
  component: AuditPage,
});

function AuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminPage title="Auditoria" description="Tudo que foi feito no painel, por quem e quando.">
      <Panel title="Últimos 200 eventos">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Quando</th>
                <th className="py-2 pr-4">Quem</th>
                <th className="py-2 pr-4">Ação</th>
                <th className="py-2 pr-4">Entidade</th>
                <th className="py-2">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row) => (
                <tr key={row.id} className="border-t border-border/60 align-top">
                  <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">
                    {dateBR(row.created_at)}
                  </td>
                  <td className="py-2 pr-4">{row.actor_email ?? "—"}</td>
                  <td className="py-2 pr-4 font-medium">{row.action}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {row.entity ?? "—"}
                    {row.entity_id ? ` · ${row.entity_id.slice(0, 8)}` : ""}
                  </td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">
                    {JSON.stringify(row.meta)}
                  </td>
                </tr>
              ))}
              {data?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum evento registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminPage>
  );
}
