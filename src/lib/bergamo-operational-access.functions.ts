import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import {
  deleteHotmartValidationUser,
  linkBergamoCoproducer,
  listBergamoCoproducers,
  listHotmartValidationAccounts,
  provisionHotmartValidationAccount,
  revokeBergamoCoproducerLink,
  revokeHotmartValidationAccess,
  setBergamoCoproducerMemberPreview,
} from "./bergamo-operational-access.server";

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function strOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
function bool(value: unknown): boolean {
  return value === true;
}

// ---------------------------------------------------------------------
// Conta de validação Hotmart
// ---------------------------------------------------------------------

export const adminListHotmartValidationAccountsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listHotmartValidationAccounts(context.userId));

export const adminProvisionHotmartValidationAccountFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return {
      email: str(raw["email"]),
      password: str(raw["password"]),
      label: str(raw["label"]),
      confirmEmail: bool(raw["confirmEmail"]),
      confirmEmailReason: strOrNull(raw["confirmEmailReason"]),
      expiresAt: strOrNull(raw["expiresAt"]),
      confirmOperation: bool(raw["confirmOperation"]),
    };
  })
  .handler(async ({ context, data }) =>
    provisionHotmartValidationAccount({ actorId: context.userId, ...data }),
  );

export const adminRevokeHotmartValidationAccessFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return { userId: str(raw["userId"]) };
  })
  .handler(async ({ context, data }) => {
    if (!data.userId) throw new Error("Usuário inválido.");
    await revokeHotmartValidationAccess({ actorId: context.userId, userId: data.userId });
    return { ok: true };
  });

export const adminDeleteHotmartValidationUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return { userId: str(raw["userId"]), confirmDeleteAuthUser: bool(raw["confirmDeleteAuthUser"]) };
  })
  .handler(async ({ context, data }) => {
    if (!data.userId) throw new Error("Usuário inválido.");
    await deleteHotmartValidationUser({ actorId: context.userId, ...data });
    return { ok: true };
  });

// ---------------------------------------------------------------------
// Coprodutor real do Bergamo
// ---------------------------------------------------------------------

export const adminListBergamoCoproducersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listBergamoCoproducers(context.userId));

export const adminLinkBergamoCoproducerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return { email: str(raw["email"]) };
  })
  .handler(async ({ context, data }) => {
    if (!data.email) throw new Error("Informe um e-mail.");
    return linkBergamoCoproducer({ actorId: context.userId, ...data });
  });

export const adminRevokeBergamoCoproducerFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return { userId: str(raw["userId"]) };
  })
  .handler(async ({ context, data }) => {
    if (!data.userId) throw new Error("Usuário inválido.");
    await revokeBergamoCoproducerLink({ actorId: context.userId, userId: data.userId });
    return { ok: true };
  });

export const adminSetBergamoCoproducerMemberPreviewFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return { userId: str(raw["userId"]), enabled: bool(raw["enabled"]) };
  })
  .handler(async ({ context, data }) => {
    if (!data.userId) throw new Error("Usuário inválido.");
    await setBergamoCoproducerMemberPreview({ actorId: context.userId, ...data });
    return { ok: true };
  });
