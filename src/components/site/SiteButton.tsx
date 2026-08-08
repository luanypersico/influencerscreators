import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold " +
  "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_10px_30px_color-mix(in_oklab,var(--primary)_34%,transparent)] hover:-translate-y-0.5 hover:bg-primary/90",
  outline:
    "border border-border bg-card/35 text-foreground hover:border-primary/70 hover:bg-primary/10 hover:text-foreground",
  ghost: "text-muted-foreground hover:text-foreground",
};

export interface SiteButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  /** Navigates via the router; omit for a plain button (conceptual CTAs that go nowhere yet). */
  to?: string;
}

/**
 * Pill CTA in the same visual language as CopyButton/FilterChip/ModeButton in
 * the lab — deliberately not the shadcn `Button` primitive, which defaults
 * to a squared radius that breaks that established pill language.
 */
export function SiteButton({
  variant = "primary",
  className,
  children,
  to,
  ...buttonProps
}: SiteButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], className);

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
