import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminPage, Panel } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoles, useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/configuracoes")({
  component: SettingsPage,
});

type Brand = { company?: string; support_email?: string };
type EmailCfg = { from_name?: string; from_email?: string };

function SettingsPage() {
  const qc = useQueryClient();
  const { user } = useSession();
  const { isSuperAdmin } = useRoles(user?.id);
  const [brand, setBrand] = useState<Brand>({});
  const [emailCfg, setEmailCfg] = useState<EmailCfg>({});
  const [newPassword, setNewPassword] = useState("");

  const { data } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!data) return;
    setBrand((data.find((s) => s.key === "brand")?.value ?? {}) as Brand);
    setEmailCfg((data.find((s) => s.key === "email")?.value ?? {}) as EmailCfg);
  }, [data]);

  async function save(key: string, value: Brand | EmailCfg) {
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value: value as never, updated_by: user?.id ?? null });
    if (error) toast.error(error.message);
    else {
      toast.success("Configuração salva.");
      await qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    }
  }

  async function changeOwnPassword() {
    if (newPassword.length < 8) {
      toast.error("Use pelo menos 8 caracteres.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else {
      toast.success("Senha atualizada.");
      setNewPassword("");
    }
  }

  return (
    <AdminPage title="Configurações" description="Identidade da empresa, remetente de e-mail e sua própria conta.">
      <Panel title="Marca">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Empresa</Label>
            <Input value={brand.company ?? ""} onChange={(e) => setBrand({ ...brand, company: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">E-mail de suporte</Label>
            <Input
              value={brand.support_email ?? ""}
              onChange={(e) => setBrand({ ...brand, support_email: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" size="sm" disabled={!isSuperAdmin} onClick={() => save("brand", brand)}>
          Salvar marca
        </Button>
      </Panel>

      <Panel title="Remetente de e-mail" description="Usado em todos os envios do painel. Precisa ser um domínio verificado.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nome do remetente</Label>
            <Input
              value={emailCfg.from_name ?? ""}
              onChange={(e) => setEmailCfg({ ...emailCfg, from_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">E-mail do remetente</Label>
            <Input
              placeholder="contato@seudominio.com"
              value={emailCfg.from_email ?? ""}
              onChange={(e) => setEmailCfg({ ...emailCfg, from_email: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" size="sm" disabled={!isSuperAdmin} onClick={() => save("email", emailCfg)}>
          Salvar remetente
        </Button>
      </Panel>

      <Panel title="Minha conta">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nova senha</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-64"
            />
          </div>
          <Button size="sm" variant="outline" onClick={changeOwnPassword}>
            Trocar minha senha
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Conta logada: {user?.email}</p>
      </Panel>
    </AdminPage>
  );
}