import type { InfluencerStatus } from "@/features/influencers/types";
import { cn } from "@/lib/utils";

const LABEL: Record<InfluencerStatus, string> = {
  available: "Disponível",
  reserved: "Reservada",
  sold: "Vendida",
  coming_soon: "Em breve",
};

const CLASS: Record<InfluencerStatus, string> = {
  available: "bg-primary text-primary-foreground",
  reserved: "bg-accent text-accent-foreground",
  sold: "bg-secondary text-muted-foreground",
  coming_soon: "border border-border text-muted-foreground",
};

export interface StatusChipProps {
  status: InfluencerStatus;
  /**
   * True for every entry in this round's catalog. "Disponível" reads as a
   * real, buyable state — for a demo profile that's a false commercial
   * claim, so it's overridden to a clearly demonstrative label instead of
   * being shown as-is.
   */
  demo?: boolean;
  className?: string;
}

export function StatusChip({ status, demo, className }: StatusChipProps) {
  const isDemoAvailable = demo && status === "available";
  const label = isDemoAvailable ? "Perfil demonstrativo" : LABEL[status];
  const styleClass = isDemoAvailable ? "border border-primary/50 text-primary" : CLASS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-medium tracking-wide uppercase",
        styleClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
