import { cn } from "@/lib/utils";

export const ARSENAL_LOGO_URL =
  "https://res.cloudinary.com/duht4tq1f/image/upload/v1786219372/Design_sem_nome_3_qdxjsd.png";

export function ArsenalLogo({ className, ...props }: React.ComponentProps<"img">) {
  return (
    <img
      src={ARSENAL_LOGO_URL}
      alt="Arsenal de Prompts"
      className={cn("h-auto object-contain", className)}
      {...props}
    />
  );
}
