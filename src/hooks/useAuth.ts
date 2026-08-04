import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "coproducer" | "support" | "member";

/** Sessão atual do usuário (reativa). */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

/** Papéis do usuário logado. */
export function useRoles(userId: string | undefined) {
  const query = useQuery({
    queryKey: ["roles", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as AppRole);
    },
  });

  const roles = query.data ?? [];
  return {
    roles,
    isSuperAdmin: roles.includes("super_admin"),
    isAdmin: roles.includes("super_admin") || roles.includes("admin"),
    loading: query.isLoading,
  };
}