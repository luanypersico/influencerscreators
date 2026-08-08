import type { PlaceholderVariant } from "@/features/influencers/types";
import { cn } from "@/lib/utils";

/**
 * Six visually distinct, CSS-only backgrounds for "coming soon" influencers —
 * no photography, no external images. Each variant must stay visually
 * distinct from the others so the catalog never reads as one identity
 * repeated under different names.
 */
const VARIANT_BACKGROUND: Record<PlaceholderVariant, string> = {
  1: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 52%, var(--card)), var(--background) 70%)",
  2: "linear-gradient(225deg, color-mix(in oklab, var(--secondary) 72%, var(--card)), var(--background) 65%)",
  3: "radial-gradient(circle at 30% 22%, color-mix(in oklab, var(--accent) 62%, var(--card)), var(--background) 75%)",
  4: "linear-gradient(180deg, color-mix(in oklab, var(--muted-foreground) 20%, var(--card)), var(--background))",
  5: "conic-gradient(from 210deg at 62% 38%, var(--card), var(--accent), var(--background))",
  6: "repeating-linear-gradient(45deg, var(--card) 0 2px, var(--background) 2px 22px)",
};

export interface PlaceholderArtProps {
  variant: PlaceholderVariant;
  /** Used for the oversized watermark initial — e.g. influencer name. */
  initial: string;
  className?: string;
}

/** Abstract stand-in for a cover photo on influencers that aren't revealed yet. */
export function PlaceholderArt({ variant, initial, className }: PlaceholderArtProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        variant === 4 && "grain",
        className,
      )}
      style={{ backgroundImage: VARIANT_BACKGROUND[variant] }}
    >
      <span
        className="font-display text-[8rem] leading-none text-foreground/10 select-none"
        style={{ fontSize: "min(40%, 8rem)" }}
      >
        {initial}
      </span>
    </div>
  );
}
