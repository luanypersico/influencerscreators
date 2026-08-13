import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequestHostnameFn, isArsenalHostname } from "@/lib/hostname.functions";

/** Compatibilidade temporária para links antigos de membros. */
export const Route = createFileRoute("/membros/bergamo")({
  beforeLoad: async () => {
    const hostname = await getRequestHostnameFn();
    throw redirect({ to: isArsenalHostname(hostname) ? "/prompts" : "/membros", replace: true });
  },
});
