import { Link } from "@tanstack/react-router";

import { Container } from "@/components/site/Container";

const NAV_LINK_CLASS =
  "shrink-0 rounded-full px-2.5 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground " +
  "transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:outline-none sm:px-3.5 sm:text-sm";
const NAV_LINK_ACTIVE_CLASS = "bg-secondary text-foreground";

/** Public header: wordmark + nav. Never links to /laboratorio — that route stays unlisted. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-2">
        <Link
          to="/"
          className="font-display text-sm tracking-tight whitespace-nowrap text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-xl"
        >
          A Casa do Influencer AI
        </Link>
        <nav className="flex shrink-0 items-center gap-1" aria-label="Navegação principal">
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
