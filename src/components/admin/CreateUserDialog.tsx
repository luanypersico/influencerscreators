import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminCreateUserFn } from "@/lib/admin.functions";

type ProductOption = { id: string; name: string };

export function CreateUserDialog({
  open,
  products,
  canManageAdmins,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  products: ProductOption[];
  canManageAdmins: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const createUser = useServerFn(adminCreateUserFn);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: () =>
      createUser({
        data: {
          email,
          password,
          fullName,
          role: role as "member",
          productIds: selected,
          notes,
        },
      }),
    onSuccess: (result) => {
      toast.success(
        result.tempPassword
          ? `Usuário criado. Senha temporária: ${result.tempPassword}`
          : "Usuário criado com a senha definida.",
        { duration: 12000 },
      );
      setEmail("");
      setFullName("");
      setPassword("");
      setNotes("");
      setSelected([]);
      onCreated();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Erro ao criar usuário."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar usuário manualmente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Senha (deixe vazio para gerar automaticamente)
            </Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Papel</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="member">Cliente</option>
              <option value="support">Suporte</option>
              <option value="coproducer">Co-produtor</option>
              {canManageAdmins && <option value="admin">Admin</option>}
              {canManageAdmins && <option value="super_admin">Super admin</option>}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Liberar acesso a produtos</Label>
            <div className="space-y-2 rounded-lg border border-border p-3">
              {products.map((p) => (
                <label key={p.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{p.name}</span>
                  <Switch
                    checked={selected.includes(p.id)}
                    onCheckedChange={(v) =>
                      setSelected((prev) =>
                        v ? [...prev, p.id] : prev.filter((id) => id !== p.id),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Notas internas</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Criando..." : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
