import { SectionTitle } from "@/components/site/SectionTitle";
import { findCurrentRoutineMoment } from "@/features/influencer-studio/findCurrentRoutineMoment";
import type { InfluencerOperationalProfile } from "@/features/influencer-studio/types";
import type { TodayContext } from "@/features/influencer-studio/useTodayContext";

export interface TodayInHerLifeSectionProps {
  name: string;
  operational: InfluencerOperationalProfile;
  today: TodayContext | null;
}

/** "Hoje na vida dela" — a contextual, clearly illustrative snapshot. No real-time memory is implied. */
export function TodayInHerLifeSection({ name, operational, today }: TodayInHerLifeSectionProps) {
  const currentMoment = today
    ? findCurrentRoutineMoment(operational.routine, today.hour)
    : undefined;
  const scenario = operational.recurringEnvironments[0];

  return (
    <section className="border-b border-border px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          kicker="Agora"
          title={`Hoje na vida de ${name}`}
          subtitle="Um retrato ilustrativo do momento — não é um registro em tempo real."
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
              Momento provável
            </span>
            {currentMoment ? (
              <>
                <p className="mt-1.5 text-base text-foreground">{currentMoment.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{currentMoment.description}</p>
              </>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {today
                  ? `${today.weekdayLabel}, período da ${today.timeOfDayLabel}.`
                  : "Carregando..."}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
              Cenário coerente
            </span>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {scenario ?? "Cenário em definição."}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Sugestões de conteúdo para agora
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {["Stories de hoje", "Rotina", "Foto para o feed"].map((suggestion) => (
              <span
                key={suggestion}
                className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs text-muted-foreground"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
