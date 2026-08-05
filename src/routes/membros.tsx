import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout pathless para /membros/* — o conteúdo de cada página fica nos filhos. */
export const Route = createFileRoute("/membros")({
  component: () => <Outlet />,
});
