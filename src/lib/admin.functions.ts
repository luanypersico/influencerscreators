import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertAdmin,
  assertSuperAdmin,
  createProductCollaborator,
  createUser,
  deleteUser,
  getOverview,
  listUsers,
  resolveRecipients,
  revokeProductCollaborator,
  sendEmails,
  setAccess,
  setUserPassword,
  setUserRole,
  type AdminRole,
  type CollaboratorRole,
} from "./admin.server";

export const adminOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    return getOverview();
  });

export const adminListUsersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: { search?: string } | undefined) => ({ search: data?.search ?? "" }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return listUsers(data.search);
  });

export const adminCreateUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      email: string;
      password?: string;
      fullName?: string;
      role: AdminRole;
      productIds?: string[];
      notes?: string;
    }) => {
      if (!data?.email?.includes("@")) throw new Error("Informe um e-mail válido.");
      return {
        email: data.email,
        password: data.password ?? "",
        fullName: data.fullName ?? "",
        role: data.role ?? ("member" as AdminRole),
        productIds: data.productIds ?? [],
        notes: data.notes ?? "",
      };
    },
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    if (data.role === "super_admin" || data.role === "admin") {
      await assertSuperAdmin(context.userId);
    }
    return createUser({
      actorId: context.userId,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: data.role,
      productIds: data.productIds,
      notes: data.notes,
    });
  });

export const adminDeleteUserFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { userId: string }) => {
    if (!data?.userId) throw new Error("Usuário inválido.");
    return { userId: data.userId };
  })
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    await deleteUser({ actorId: context.userId, userId: data.userId });
    return { ok: true };
  });

export const adminSetPasswordFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { userId: string; password: string }) => {
    if (!data?.userId) throw new Error("Usuário inválido.");
    if (!data?.password || data.password.length < 8)
      throw new Error("Senha muito curta (mínimo 8).");
    return { userId: data.userId, password: data.password };
  })
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    await setUserPassword({
      actorId: context.userId,
      userId: data.userId,
      password: data.password,
    });
    return { ok: true };
  });

export const adminSetRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { userId: string; role: AdminRole; enabled: boolean }) => {
    if (!data?.userId || !data?.role) throw new Error("Dados inválidos.");
    return { userId: data.userId, role: data.role, enabled: Boolean(data.enabled) };
  })
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    await setUserRole({ actorId: context.userId, ...data });
    return { ok: true };
  });

export const adminSetAccessFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: { userId: string; productId: string; enabled: boolean; expiresAt?: string | null }) => {
      if (!data?.userId || !data?.productId) throw new Error("Dados inválidos.");
      return {
        userId: data.userId,
        productId: data.productId,
        enabled: Boolean(data.enabled),
        expiresAt: data.expiresAt ?? null,
      };
    },
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    await setAccess({ actorId: context.userId, ...data });
    return { ok: true };
  });

export const adminPreviewAudienceFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      audience: "all" | "buyers" | "leads" | "product" | "manual";
      productId?: string | null;
      manual?: string[];
    }) => ({
      audience: data?.audience ?? "all",
      productId: data?.productId ?? null,
      manual: data?.manual ?? [],
    }),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const recipients = await resolveRecipients(data);
    return { count: recipients.length, sample: recipients.slice(0, 8) };
  });

export const adminSendEmailFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      subject: string;
      html: string;
      audience: "all" | "buyers" | "leads" | "product" | "manual";
      productId?: string | null;
      manual?: string[];
      campaignId?: string | null;
    }) => {
      if (!data?.subject?.trim()) throw new Error("Informe o assunto.");
      if (!data?.html?.trim()) throw new Error("Escreva o conteúdo do e-mail.");
      return {
        subject: data.subject,
        html: data.html,
        audience: data.audience ?? "all",
        productId: data.productId ?? null,
        manual: data.manual ?? [],
        campaignId: data.campaignId ?? null,
      };
    },
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const recipients = await resolveRecipients({
      audience: data.audience,
      productId: data.productId,
      manual: data.manual,
    });
    if (recipients.length === 0)
      throw new Error("Nenhum destinatário encontrado para este público.");
    return sendEmails({
      actorId: context.userId,
      recipients,
      subject: data.subject,
      html: data.html,
      campaignId: data.campaignId,
    });
  });

export const adminCreateCollaboratorFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    const role = raw["role"];
    return {
      productId: typeof raw["productId"] === "string" ? raw["productId"] : "",
      userId: typeof raw["userId"] === "string" ? raw["userId"] : "",
      role: (role === "coproducer" || role === "editor" || role === "support"
        ? role
        : "support") as CollaboratorRole,
    };
  })
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    if (!data.productId || !data.userId) throw new Error("Dados inválidos.");
    await createProductCollaborator({ actorId: context.userId, ...data });
    return { ok: true };
  });

export const adminRevokeCollaboratorFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return {
      productId: typeof raw["productId"] === "string" ? raw["productId"] : "",
      userId: typeof raw["userId"] === "string" ? raw["userId"] : "",
    };
  })
  .handler(async ({ context, data }) => {
    await assertSuperAdmin(context.userId);
    if (!data.productId || !data.userId) throw new Error("Dados inválidos.");
    await revokeProductCollaborator({ actorId: context.userId, ...data });
    return { ok: true };
  });
