import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequestHostnameFn } from "@/lib/hostname.functions";

/** Compatibilidade temporária para links do antigo produto. */
export const Route = createFileRoute("/bergamo")({
  beforeLoad: async () => {
    await getRequestHostnameFn();
    throw redirect({ to: "/", replace: true });
  },
});
