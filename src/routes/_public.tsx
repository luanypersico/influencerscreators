import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getRequestHostnameFn, isArsenalHostname } from "@/lib/hostname.functions";

/** Pathless layout shared by every public Casa page. /laboratorio deliberately lives outside it. */
export const Route = createFileRoute("/_public")({
  loader: () => getRequestHostnameFn(),
  component: PublicLayout,
});

function PublicLayout() {
  const hostname = Route.useLoaderData();

  if (isArsenalHostname(hostname)) return <Outlet />;

  return (
    <div className="studio-page flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
