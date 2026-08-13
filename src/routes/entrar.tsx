import { createFileRoute, redirect } from "@tanstack/react-router";

import { BuyerAuthPage } from "./auth";
import { getRequestHostnameFn, isArsenalHostname } from "@/lib/hostname.functions";

/** Endereço público canônico do login; /auth permanece por compatibilidade técnica. */
export const Route = createFileRoute("/entrar")({
  beforeLoad: async () => {
    if (!isArsenalHostname(await getRequestHostnameFn()))
      throw redirect({ to: "/auth", replace: true });
  },
  component: BuyerAuthPage,
});
