import { SectionTitle } from "@/components/site/SectionTitle";
import type { InfluencerOperationalProfile } from "@/features/influencer-studio/types";

export interface ContinuitySectionProps {
  name: string;
  operational: InfluencerOperationalProfile;
}

/** Explains the future memory system conceptually — never claims it exists yet. */
export function ContinuitySection({ name, operational }: ContinuitySectionProps) {
  return (
    <section className="border-b border-border px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionTitle kicker="Continuidade" title="O que o estúdio vai lembrar" />
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {operational.memoryPreview.note}
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {operational.memoryPreview.examples.map((example) => (
            <li
              key={example}
              className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground"
            >
              {example}
            </li>
          ))}
        </ul>

        {operational.continuityNotes.length > 0 && (
          <div className="mt-8">
            <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Regras de continuidade previstas para {name}
            </span>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {operational.continuityNotes.map((note) => (
                <li key={note} className="text-sm text-muted-foreground">
                  · {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
