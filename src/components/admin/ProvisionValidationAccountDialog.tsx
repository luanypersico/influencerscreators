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
import { adminProvisionHotmartValidationAccountFn } from "@/lib/bergamo-operational-access.functions";

export function ProvisionValidationAccountDialog({
  open,
  onOpenChange,
  onProvisioned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProvisioned: () => void;
}) {
  const provision = useServerFn(adminProvisionHotmartValidationAccountFn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [confirmEmailReason, setConfirmEmailReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [confirmOperation, setConfirmOperation] = useState(false);

  function reset() {
    setEmail("");
    setPassword("");
    setLabel("");
    setConfirmEmail(false);
    setConfirmEmailReason("");
    setExpiresAt("");
    setConfirmOperation(false);
  }

  const mutation = useMutation({
    mutationFn: () =>
      provision({
        data: {
          email,
          password,
          label,
          confirmEmail,
          confirmEmailReason: confirmEmail ? confirmEmailReason : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          confirmOperation,
        },
      }),
    onSuccess: () => {
      toast.success("Conta de validação provisionada. A senha não é reexibida por segurança.");
      reset();
      onProvisioned();
      onOpenChange(false);
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Não foi possível provisionar a conta."),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Provisionar conta de validação Hotmart</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Esta conta recebe somente acesso ao produto Bergamo (product_access). Nunca recebe papel
            administrativo nem vínculo de coprodutor. A senha não será exibida novamente depois de
            criada — anote-a antes de confirmar.
          </p>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">E-mail da conta de validação</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="validacao-hotmart@seudominio.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Senha inicial (mínimo 12 caracteres)
            </Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nome identificador</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Validação Hotmart — Bergamo"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Expiração (opcional)</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>

          <div className="space-y-2 rounded-lg border border-border p-3">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>Confirmar e-mail automaticamente</span>
              <Switch checked={confirmEmail} onCheckedChange={setConfirmEmail} />
            </label>
            {confirmEmail && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Motivo (obrigatório, fica registrado na auditoria)
                </Label>
                <Textarea
                  rows={2}
                  value={confirmEmailReason}
                  onChange={(e) => setConfirmEmailReason(e.target.value)}
                  placeholder="Ex.: a Hotmart exige login imediato sem etapa de confirmação de e-mail."
                />
              </div>
            )}
          </div>

          <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
            <span>Confirmo explicitamente esta operação</span>
            <Switch checked={confirmOperation} onCheckedChange={setConfirmOperation} />
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={
              mutation.isPending ||
              !email.trim() ||
              !password.trim() ||
              !label.trim() ||
              !confirmOperation
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Provisionando..." : "Provisionar conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
