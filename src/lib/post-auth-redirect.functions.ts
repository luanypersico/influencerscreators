import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { getPostAuthDestination } from "./post-auth-redirect.server";

/** Returns only an internal, fixed path for the authenticated caller. */
export const getPostAuthDestinationFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => getPostAuthDestination(context.userId));
