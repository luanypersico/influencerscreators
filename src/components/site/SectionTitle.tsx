import { cn } from "@/lib/utils";

export interface SectionTitleProps {
  kicker: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

/** Kicker + heading + optional subtext — the pattern already used across the lab's sections. */
export function SectionTitle({
  kicker,
  title,
  subtitle,
  align = "left",
  className,
}: SectionTitleProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
        {kicker}
      </span>
      <h2 className="mt-2 text-4xl md:text-5xl">{title}</h2>
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
