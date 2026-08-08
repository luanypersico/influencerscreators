import { Link } from "@tanstack/react-router";

import { Container } from "@/components/site/Container";
import { ArsenalLogo } from "@/components/brand/ArsenalLogo";

const NAV_LINK_CLASS =
  "rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors " +
  "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";
const NAV_LINK_ACTIVE_CLASS = "bg-secondary text-foreground";

/** Public header: wordmark + nav. Never links to /laboratorio — that route stays unlisted. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <Container className="studio-surface flex h-16 items-center justify-between rounded-2xl px-4 backdrop-blur-xl sm:px-5">
        <Link
          to="/"
          className="rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArsenalLogo className="w-24 sm:w-28" />
        </Link>
        <nav className="flex items-center gap-1" aria-label="Navegação principal">
          <Link
            to="/influencers"
            className={NAV_LINK_CLASS}
            activeProps={{ className: NAV_LINK_ACTIVE_CLASS }}
          >
            Influencers
          </Link>
          <Link
            to="/como-funciona"
            className={NAV_LINK_CLASS}
            activeProps={{ className: NAV_LINK_ACTIVE_CLASS }}
          >
            Como funciona
          </Link>
        </nav>
      </Container>
    </header>
  );
}
