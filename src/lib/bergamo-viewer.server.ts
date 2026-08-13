import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { getBergamoFullCatalog } from "./bergamo-admin-catalog.server";
import type { BergamoPublicCatalog } from "./bergamo-catalog.server";
import { attachBergamoPrivateImages } from "./bergamo-private-images.server";

export type BergamoViewerDestination = "/admin" | "/coprodutor/bergamo" | "/prompts" | "/membros";

export interface BergamoViewer {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  label: "Administrador" | "Coprodutor" | "Aluno Bergamo" | "Conta conectada";
  destination: BergamoViewerDestination;
  hasFullAccess: boolean;
}

export interface BergamoAuthenticatedExperience {
  viewer: BergamoViewer;
  catalog: BergamoPublicCatalog | null;
}

export interface BergamoViewerAuthorizationFacts {
  roles: string[];
  hasActiveCoproducerLink: boolean;
  hasActiveProductAccess: boolean;
}

export function resolveBergamoViewerAuthorization({
  roles,
  hasActiveCoproducerLink,
  hasActiveProductAccess,
}: BergamoViewerAuthorizationFacts): Pick<
  BergamoViewer,
  "label" | "destination" | "hasFullAccess"
> {
  if (roles.includes("super_admin") || roles.includes("admin")) {
    return { label: "Administrador", destination: "/admin", hasFullAccess: true };
  }
  if (hasActiveCoproducerLink) {
    return {
      label: "Coprodutor",
      destination: "/coprodutor/bergamo",
      hasFullAccess: true,
    };
  }
  if (hasActiveProductAccess) {
    return { label: "Aluno Bergamo", destination: "/prompts", hasFullAccess: true };
  }
  return { label: "Conta conectada", destination: "/membros", hasFullAccess: false };
}

/**
 * Resolve perfil e acesso exclusivamente no servidor. O produto é sempre
 * Bergamo e nenhuma role, user_id ou product_id vem do navegador.
 */
export async function getBergamoAuthenticatedExperience(
  userId: string,
): Promise<BergamoAuthenticatedExperience> {
  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .select("id")
    .eq("slug", "bergamo")
    .maybeSingle();
  if (productError) throw new Error(productError.message);
  if (!product) throw new Error("Produto Bergamo não encontrado.");

  const [profileResult, rolesResult, collaboratorResult, productAccessResult] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", userId)
      .maybeSingle(),
    supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
    supabaseAdmin
      .from("product_collaborators")
      .select("id")
      .eq("product_id", product.id)
      .eq("user_id", userId)
      .eq("role", "coproducer")
      .eq("status", "active")
      .maybeSingle(),
    supabaseAdmin.rpc("has_product_access", {
      _user_id: userId,
      _product_id: product.id,
    }),
  ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (rolesResult.error) throw new Error(rolesResult.error.message);
  if (collaboratorResult.error) throw new Error(collaboratorResult.error.message);
  if (productAccessResult.error) throw new Error(productAccessResult.error.message);

  const authorization = resolveBergamoViewerAuthorization({
    roles: (rolesResult.data ?? []).map((row) => row.role),
    hasActiveCoproducerLink: Boolean(collaboratorResult.data),
    hasActiveProductAccess: Boolean(productAccessResult.data),
  });
  const profile = profileResult.data;
  const email = profile?.email ?? "";
  const displayName = profile?.full_name?.trim() || email.split("@")[0] || "Minha conta";

  const catalog = authorization.hasFullAccess
    ? await attachBergamoPrivateImages(await getBergamoFullCatalog())
    : null;

  return {
    viewer: {
      displayName,
      email,
      avatarUrl: profile?.avatar_url ?? null,
      ...authorization,
    },
    catalog,
  };
}
