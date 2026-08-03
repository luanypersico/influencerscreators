import { cn } from "@/lib/utils";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Shared max-width wrapper — consolidates the `mx-auto max-w-6xl` pattern repeated across sections. */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto max-w-6xl px-6 md:px-10", className)}>{children}</div>;
}
