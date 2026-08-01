import { REALISM_RULES } from "@/data/builder";

/** The six rules that account for most of the realism gap. */
export function RealismRules() {
  return (
    <section id="regras" className="border-t border-border px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary uppercase">
          Método
        </span>
        <h2 className="mt-2 text-4xl md:text-5xl">As 6 regras que fazem a diferença</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Não é sobre prompt longo. É sobre descrever física, luz e imperfeição — as três coisas que
          todo modelo suaviza por padrão.
        </p>

        <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {REALISM_RULES.map((rule, i) => (
            <li key={rule.title} className="bg-background p-6">
              <span className="font-mono text-xs text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-xl leading-tight">{rule.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{rule.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}