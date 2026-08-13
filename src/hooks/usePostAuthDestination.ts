import { useCallback } from "react";

import { supabase } from "@/integrations/supabase/client";

/** Client adapter for the single server-side post-auth destination resolver. */
export function usePostAuthDestination() {
  return useCallback(async () => {
    const { data, error } = await supabase.rpc("get_my_post_auth_destination");
    if (error) throw error;
    if (
      data !== "/admin" &&
      data !== "/coprodutor/bergamo" &&
      data !== "/prompts" &&
      data !== "/membros"
    ) {
      throw new Error("Destino de acesso inválido.");
    }
    return data;
  }, []);
}
