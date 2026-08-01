import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export interface CopyButtonProps extends React.ComponentProps<"button"> {
  /** Text placed on the clipboard when clicked. */
  value: string;
  /** Visible label in the idle state. */
  label?: string;
}

/**
 * Clipboard button with an optimistic "copied" state.
 *
 * navigator.clipboard is unavailable on insecure origins and in some in-app
 * browsers, so the failure path is handled explicitly instead of throwing an
 * unhandled rejection.
 */
export function CopyButton({ value, label = "Copiar", className, ...rest }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = useCallback(async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API indisponível");
      await navigator.clipboard.writeText(value);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1600);
      toast.success("Prompt copiado");
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${label} para a área de transferência`}
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border border-border bg-secondary px-3 py-1.5",
        "text-xs font-medium tracking-wide text-secondary-foreground uppercase",
        "transition-colors hover:border-primary/60 hover:text-primary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        copied && "border-primary/60 text-primary",
        className,
      )}
      {...rest}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copiado" : label}
    </button>
  );
}