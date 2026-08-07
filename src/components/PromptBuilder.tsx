import { RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { CopyButton } from "@/components/CopyButton";
import { FIELDS, NEGATIVE_PROMPT } from "@/data/builder";
import { cn } from "@/lib/utils";

type Selection = Record<string, number>;

const DEFAULT_SELECTION: Selection = Object.fromEntries(FIELDS.map((f) => [f.id, 0]));

/**
 * Composes a photorealism prompt from nine independent axes plus an optional
 * identity lock block that keeps the same character across generations.
 */
export function PromptBuilder() {
  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION);
  const [identity, setIdentity] = useState("");

  const pick = useCallback((fieldId: string, index: number) => {
    setSelection((prev) => ({ ...prev, [fieldId]: index }));
  }, []);

  const randomize = useCallback(() => {
    setSelection(
      Object.fromEntries(FIELDS.map((f) => [f.id, Math.floor(Math.random() * f.options.length)])),
    );
  }, []);

  const prompt = useMemo(() => {
    const parts = FIELDS.map((f) => f.options[selection[f.id] ?? 0]?.value).filter(Boolean);
    const [subject, shot, camera, light, scene, wardrobe, expression, skin, finish] = parts;
    const identityBlock = identity.trim()
      ? ` Identity lock (keep identical across every image): ${identity.trim()}.`
      : "";

    return [
      `Photorealistic photograph of ${subject}, ${scene}.`,
      `${shot}. ${wardrobe}. ${expression}.`,
      `${camera}. ${light}.`,
      `${skin}.`,
      `${finish}.`,
      `Absolutely no beauty filter, no skin smoothing, no symmetry correction. The image must be indistinguishable from an ordinary photo taken by a real person.${identityBlock}`,
    ].join(" ");
  }, [selection, identity]);

  const full = `${prompt}\n\nNegative prompt: ${NEGATIVE_PROMPT}`;

  return (
    <section id="montador" className="border-t border-border bg-card/40 px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
              Montador
            </span>
            <h2 className="mt-2 text-4xl md:text-5xl">Monte o seu do zero</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Nove eixos que decidem se a imagem parece foto ou parece IA. Escolha e o prompt se
              escreve embaixo.
            </p>
          </div>
          <button
            type="button"
            onClick={randomize}
            className="inline-flex items-center gap-2 self-start rounded-full border border-border px-3.5 py-2 text-xs font-medium transition-colors hover:border-primary/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <RefreshCw className="size-3.5" />
            Sortear
          </button>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            {FIELDS.map((field) => (
              <fieldset key={field.id}>
                <legend className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                  {field.label}
                </legend>
                <p className="mt-0.5 text-xs text-muted-foreground">{field.hint}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {field.options.map((opt, i) => (
                    <button
                      key={opt.label}
                      type="button"
                      aria-pressed={selection[field.id] === i}
                      onClick={() => pick(field.id, i)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        selection[field.id] === i
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}

            <fieldset>
              <legend className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                Trava de identidade
              </legend>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Marcas fixas da sua influencer. Repetir esse bloco é o que mantém a mesma pessoa em
                posts diferentes.
              </p>
              <textarea
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                rows={3}
                placeholder="ex: small mole above the left eyebrow, gap between front teeth, thin gold hoop in the right ear, faint scar on the chin"
                className="mt-2.5 w-full rounded-xl border border-input bg-background p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </fieldset>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-[0.14em] text-foreground uppercase">
                  Seu prompt
                </span>
                <CopyButton value={full} label="Copiar tudo" />
              </div>
              <pre className="mt-4 max-h-[26rem] overflow-auto font-mono text-[0.72rem] leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {prompt}
              </pre>
              <div className="mt-4 border-t border-border pt-4">
                <span className="text-[0.65rem] font-semibold tracking-[0.14em] text-primary uppercase">
                  Negative prompt
                </span>
                <p className="mt-2 font-mono text-[0.68rem] leading-relaxed text-muted-foreground">
                  {NEGATIVE_PROMPT}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
