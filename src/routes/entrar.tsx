import { createFileRoute, redirect } from "@tanstack/react-router";

import { BuyerAuthPage } from "./auth";
import { getRequestHostnameFn, isArsenalHostname } from "@/lib/hostname.functions";

const TITLE = "Entrar — Arsenal de Prompts";
const DESCRIPTION = "Ative ou acesse com segurança o seu Arsenal de Prompts Bergamo.";

/** Endereço público canônico do login; /auth permanece por compatibilidade técnica. */
export const Route = createFileRoute("/entrar")({
  beforeLoad: async () => {
    if (!isArsenalHostname(await getRequestHostnameFn()))
      throw redirect({ to: "/auth", replace: true });
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuyerAuthPage,
});
