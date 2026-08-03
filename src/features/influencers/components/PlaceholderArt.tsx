import type { PlaceholderVariant } from "@/features/influencers/types";
import { cn } from "@/lib/utils";

/**
 * Six visually distinct, CSS-only backgrounds for "coming soon" influencers —
 * no photography, no external images. Each variant must stay visually
 * distinct from the others so the catalog never reads as one identity
 * repeated under different names.
 */
const VARIANT_BACKGROUND: Record<PlaceholderVariant, string> = {
  1: "linear-gradient(135deg, oklch(0.27 0.025 55), oklch(0.14 0.008 60) 70%)",
  2: "linear-gradient(225deg, oklch(0.22 0.035 38), oklch(0.15 0.01 60) 65%)",
  3: "radial-gradient(circle at 30% 22%, oklch(0.32 0.06 50), oklch(0.13 0.008 60) 75%)",
  4: "linear-gradient(180deg, oklch(0.23 0.016 70), oklch(0.12 0.006 60))",
  5: "conic-gradient(from 210deg at 62% 38%, oklch(0.17 0.01 60), oklch(0.3 0.07 45), oklch(0.14 0.008 60))",
  6: "repeating-linear-gradient(45deg, oklch(0.19 0.01 60) 0 2px, oklch(0.15 0.008 60) 2px 22px)",
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
