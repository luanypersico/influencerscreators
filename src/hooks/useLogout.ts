import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type SignOutAuth = Pick<SupabaseClient["auth"], "signOut">;

export async function signOutAuthenticatedSession(
  auth: SignOutAuth,
  clearAuthenticatedCache: () => void,
) {
  const { error } = await auth.signOut();
  if (error) throw error;
  clearAuthenticatedCache();
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function logout() {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await signOutAuthenticatedSession(supabase.auth, () => queryClient.clear());
      await router.navigate({ to: "/auth", replace: true });
    } finally {
      setIsSigningOut(false);
    }
  }

  return { logout, isSigningOut };
}
