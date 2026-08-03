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
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-medium tracking-wide uppercase",
        CLASS[status],
        className,
      )}
    >
      {LABEL[status]}
    </span>
  );
}
