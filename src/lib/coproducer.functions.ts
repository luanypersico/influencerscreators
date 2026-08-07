import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import {
  createBergamoPrompt,
  createBergamoUpdate,
  getBergamoOverview,
  listBergamoCustomers,
  listBergamoPromptRevisions,
  listBergamoPrompts,
  listBergamoUpdates,
  reorderBergamoPrompts,
  setBergamoPromptStatus,
  setBergamoUpdateStatus,
  updateBergamoPrompt,
  updateBergamoUpdate,
  type PromptStatus,
  type UpdateStatus,
} from "./coproducer.server";

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function strOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export const coproducerGetOverviewFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getBergamoOverview(context.userId));

export const coproducerListCustomersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listBergamoCustomers(context.userId));

export const coproducerListPromptsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listBergamoPrompts(context.userId));

export const coproducerListPromptRevisionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => ({
    itemId: str((data as Record<string, unknown>)?.["itemId"]),
  }))
  .handler(async ({ context, data }) => {
    if (!data.itemId) throw new Error("Item inválido.");
    return listBergamoPromptRevisions(context.userId, data.itemId);
  });

export const coproducerCreatePromptFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return {
      title: str(raw["title"]),
      category: strOrNull(raw["category"]),
      description: strOrNull(raw["description"]),
      prompt: strOrNull(raw["prompt"]),
    };
  })
  .handler(async ({ context, data }) => {
    if (!data.title.trim()) throw new Error("Informe um título.");
    const id = await createBergamoPrompt({ actorId: context.userId, ...data });
    return { id };
  });

export const coproducerUpdatePromptFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return {
      itemId: str(raw["itemId"]),
      title: typeof raw["title"] === "string" ? raw["title"] : undefined,
      category: "category" in raw ? strOrNull(raw["category"]) : undefined,
      description: "description" in raw ? strOrNull(raw["description"]) : undefined,
      prompt: "prompt" in raw ? strOrNull(raw["prompt"]) : undefined,
    };
  })
  .handler(async ({ context, data }) => {
    if (!data.itemId) throw new Error("Item inválido.");
    await updateBergamoPrompt({ actorId: context.userId, ...data });
    return { ok: true };
  });

export const coproducerSetPromptStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    const status = raw["status"];
    return {
      itemId: str(raw["itemId"]),
      status: (status === "published" || status === "archived" || status === "draft"
        ? status
        : "draft") as PromptStatus,
    };
  })
  .handler(async ({ context, data }) => {
    if (!data.itemId) throw new Error("Item inválido.");
    await setBergamoPromptStatus({ actorId: context.userId, ...data });
    return { ok: true };
  });

export const coproducerReorderPromptsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    const ids = raw["orderedIds"];
    return {
      orderedIds: Array.isArray(ids)
        ? ids.filter((id): id is string => typeof id === "string")
        : [],
    };
  })
  .handler(async ({ context, data }) => {
    if (data.orderedIds.length === 0) throw new Error("Nenhum item para reordenar.");
    await reorderBergamoPrompts({ actorId: context.userId, ...data });
    return { ok: true };
  });

export const coproducerListUpdatesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listBergamoUpdates(context.userId));

export const coproducerCreateUpdateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return { title: str(raw["title"]), content: str(raw["content"]) };
  })
  .handler(async ({ context, data }) => {
    if (!data.title.trim() || !data.content.trim()) throw new Error("Preencha título e conteúdo.");
    const id = await createBergamoUpdate({ actorId: context.userId, ...data });
    return { id };
  });

export const coproducerUpdateUpdateFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return {
      updateId: str(raw["updateId"]),
      title: typeof raw["title"] === "string" ? raw["title"] : undefined,
      content: typeof raw["content"] === "string" ? raw["content"] : undefined,
    };
  })
  .handler(async ({ context, data }) => {
    if (!data.updateId) throw new Error("Atualização inválida.");
    await updateBergamoUpdate({ actorId: context.userId, ...data });
    return { ok: true };
  });

export const coproducerSetUpdateStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    const status = raw["status"];
    return {
      updateId: str(raw["updateId"]),
      status: (status === "published" || status === "archived" || status === "draft"
        ? status
        : "draft") as UpdateStatus,
    };
  })
  .handler(async ({ context, data }) => {
    if (!data.updateId) throw new Error("Atualização inválida.");
    await setBergamoUpdateStatus({ actorId: context.userId, ...data });
    return { ok: true };
  });
