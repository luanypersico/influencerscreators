import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PostAuthDestination = "/admin" | "/coprodutor/bergamo" | "/prompts" | "/membros";

export interface PostAuthAuthorization {
  roles: string[];
  hasActiveBergamoCoproducerLink: boolean;
}

/** Maintains the fixed destination priority in one place. */
export function resolvePostAuthDestination({
  roles,
  hasActiveBergamoCoproducerLink,
}: PostAuthAuthorization): PostAuthDestination {
  if (roles.includes("super_admin") || roles.includes("admin")) return "/admin";
  if (hasActiveBergamoCoproducerLink) return "/coprodutor/bergamo";
  return "/prompts";
}

/** Resolves an authenticated user's destination from server-side facts only. */
export async function getPostAuthDestination(userId: string): Promise<PostAuthDestination> {
  const [{ data: roles, error: rolesError }, { data: bergamo, error: productError }] =
    await Promise.all([
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
      supabaseAdmin.from("products").select("id").eq("slug", "bergamo").maybeSingle(),
    ]);

  if (rolesError) throw new Error(rolesError.message);
  if (productError) throw new Error(productError.message);

  const isAdmin = (roles ?? []).some((row) => row.role === "super_admin" || row.role === "admin");
  if (isAdmin) return "/admin";
  if (!bergamo) return "/membros";

  const { data: collaborator, error: collaboratorError } = await supabaseAdmin
    .from("product_collaborators")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", bergamo.id)
    .eq("role", "coproducer")
    .eq("status", "active")
    .maybeSingle();

  if (collaboratorError) throw new Error(collaboratorError.message);

  return resolvePostAuthDestination({
    roles: (roles ?? []).map((row) => row.role),
    hasActiveBergamoCoproducerLink: Boolean(collaborator),
  });
}
