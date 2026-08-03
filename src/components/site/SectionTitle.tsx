import { cn } from "@/lib/utils";

export interface SectionTitleProps {
  kicker: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  /**
   * Defaults to h2 (a section heading). Pass "h1" only for the single
   * top-level heading of a page that has no other <h1> — e.g. the main
   * title on /influencers or /como-funciona.
   */
  headingAs?: "h1" | "h2";
}

/** Kicker + heading + optional subtext — the pattern already used across the lab's sections. */
export function SectionTitle({
  kicker,
  title,
  subtitle,
  align = "left",
  className,
  headingAs = "h2",
}: SectionTitleProps) {
  const Heading = headingAs;

  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
        {kicker}
      </span>
      <Heading className="mt-2 text-4xl md:text-5xl">{title}</Heading>
      {subtitle && (
        <p
          className={cn(
            "mt-2 max-w-xl text-sm text-muted-foreground",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
