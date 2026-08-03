import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FORMAT_RANGE, buildPlanBeats } from "@/features/influencer-studio/planTemplates";
import type { StudioContentAction, StudioTone } from "@/features/influencer-studio/types";
import type { RoutineMoment } from "@/features/influencers/types";
import { cn } from "@/lib/utils";

const OBJECTIVES = [
  "Vender um produto",
  "Aumentar engajamento",
  "Mostrar rotina",
  "Educar a audiência",
  "Fortalecer a marca pessoal",
];

const TONES: { id: StudioTone; label: string }[] = [
  { id: "casual", label: "Casual" },
  { id: "educational", label: "Educativo" },
  { id: "commercial", label: "Comercial" },
];

const TOTAL_STEPS = 5;

export interface ContentPlanDialogProps {
  action: StudioContentAction | null;
  onClose: () => void;
  influencerName: string;
  associatedProducts: string[];
  routine: RoutineMoment[];
}

export function ContentPlanDialog({
  action,
  onClose,
  influencerName,
  associatedProducts,
  routine,
}: ContentPlanDialogProps) {
  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState<string | null>(null);
  const [theme, setTheme] = useState("");
  const [tone, setTone] = useState<StudioTone | null>(null);
  const [count, setCount] = useState(1);

  // Reset the wizard every time a new action is opened.
  useEffect(() => {
    if (!action) return;
    setStep(1);
    setObjective(null);
    setTheme("");
    setTone(null);
    setCount(FORMAT_RANGE[action.id].default);
  }, [action]);

  if (!action) return null;

  const range = FORMAT_RANGE[action.id];
  const beats = buildPlanBeats(action.id, count, routine);

  const canContinue =
    (step === 1 && objective !== null) ||
    (step === 2 && true) ||
    (step === 3 && tone !== null) ||
    step === 4;

  return (
    <Dialog open={action !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{action.label}</DialogTitle>
          <DialogDescription>
            Etapa {step} de {TOTAL_STEPS} — planejando com {influencerName}.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {step === 1 && (
            <StepChoice
              legend="Qual o objetivo desse conteúdo?"
              options={OBJECTIVES}
              value={objective}
              onChange={setObjective}
            />
          )}

          {step === 2 && (
            <div>
              <label htmlFor="studio-theme" className="text-sm font-medium text-foreground">
                Produto ou tema (opcional)
              </label>
              <input
                id="studio-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="ex: sérum facial"
                className="mt-2 w-full rounded-full border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
              {associatedProducts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {associatedProducts.map((product) => (
                    <button
                      key={product}
                      type="button"
                      onClick={() => setTheme(product)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {product}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <StepChoice
              legend="Qual o tom?"
              options={TONES.map((t) => t.label)}
              value={tone ? (TONES.find((t) => t.id === tone)?.label ?? null) : null}
              onChange={(label) => setTone(TONES.find((t) => t.label === label)?.id ?? null)}
            />
          )}

          {step === 4 && (
            <div>
              <span className="text-sm font-medium text-foreground">
                {action.id === "routine" ? "Quantos momentos incluir?" : "Quantidade"}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i).map(
                  (n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={count === n}
                      onClick={() => setCount(n)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        count === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      {n}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Summary label="Objetivo" value={objective ?? "—"} />
                <Summary label="Tema" value={theme || "Sem tema específico"} />
                <Summary label="Tom" value={TONES.find((t) => t.id === tone)?.label ?? "—"} />
                <Summary label="Formato" value={`${count} ${count === 1 ? "peça" : "peças"}`} />
              </dl>

              <span className="mt-5 block text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
                Prévia do plano
              </span>
              <ol className="mt-2.5 flex flex-col gap-2.5">
                {beats.map((beat) => (
                  <li key={beat.title} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-sm font-medium text-foreground">{beat.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{beat.description}</p>
                  </li>
                ))}
              </ol>

              <p className="mt-5 rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                Geração será ativada em uma próxima etapa.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (step === 1 ? onClose() : setStep((s) => s - 1))}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="cursor-not-allowed rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-muted-foreground opacity-70"
            >
              Gerar conteúdo
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepChoice({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              value === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary/50",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
