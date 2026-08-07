import { useServerFn } from "@tanstack/react-start";
import { useCallback } from "react";

import { getPostAuthDestinationFn } from "@/lib/post-auth-redirect.functions";

/** Client adapter for the single server-side post-auth destination resolver. */
export function usePostAuthDestination() {
  const getDestination = useServerFn(getPostAuthDestinationFn);

  return useCallback(() => getDestination(), [getDestination]);
}
