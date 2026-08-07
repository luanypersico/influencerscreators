import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export interface PromptOutputProps {
  value: string;
  /** Called when the user hand-edits the prompt. */
  onChange: (next: string) => void;
  onClear: () => void;
  /** Optional negative prompt shown under the main output. */
  negative?: string;
}

/** The prompt surface: read-only by default, editable on demand, copyable always. */
export function PromptOutput({ value, onChange, onClear, negative }: PromptOutputProps) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const payload = negative ? `${value}\n\nNegative prompt: ${negative}` : value;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard indisponível");
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1600);
      toast.success("Prompt copiado");
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto manualmente.");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="truncate text-base font-semibold text-card-foreground">
          Seu prompt otimizado <span className="text-muted-foreground">↓</span>
        </h2>
        <div className="flex shrink-0 gap-1.5">
          <Action onClick={onClear} icon={<Trash2 className="size-3.5" />}>
            Limpar
          </Action>
          <Action
            onClick={() => setEditing((v) => !v)}
            active={editing}
            icon={<Pencil className="size-3.5" />}
          >
            Editar
          </Action>
          <Action
            onClick={copy}
            active={copied}
            icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          >
            {copied ? "Copiado" : "Copiar"}
          </Action>
        </div>
      </div>

      <textarea
        value={value}
        readOnly={!editing}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        aria-label="Prompt gerado"
        className={cn(
          "mt-4 w-full resize-y rounded-xl border bg-background p-4 font-mono text-xs leading-relaxed text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          editing ? "border-primary/60" : "border-border",
        )}
      />

      {negative && (
        <details className="mt-3 rounded-xl border border-border bg-background p-3">
          <summary className="cursor-pointer text-xs font-medium text-primary">
            Negative prompt (copiado junto)
          </summary>
          <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
            {negative}
          </p>
        </details>
      )}
    </section>
  );
}

function Action({
  icon,
  active,
  children,
  ...rest
}: React.ComponentProps<"button"> & { icon: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:text-foreground",
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
