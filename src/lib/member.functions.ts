import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import {
  getBergamoMemberContent,
  getBergamoMemberImageSignedUrl,
  getMyProductAccess,
} from "./member.server";

export const memberGetMyAccessFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getMyProductAccess(context.userId));

export const memberGetBergamoContentFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getBergamoMemberContent(context.userId));

export const memberGetBergamoImageSignedUrlFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>;
    return { code: typeof raw["code"] === "string" ? raw["code"] : "" };
  })
  .handler(async ({ context, data }) => {
    if (!data.code) throw new Error("Código inválido.");
    return getBergamoMemberImageSignedUrl(context.userId, context.supabase, data.code);
  });
