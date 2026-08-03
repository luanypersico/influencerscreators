import type { RoutineMoment } from "@/features/influencers/types";

export interface RoutineTimelineProps {
  moments: RoutineMoment[];
  name: string;
}

/** "Um dia na vida dela" — proves continuity, not just a single pretty image. */
export function RoutineTimeline({ moments, name }: RoutineTimelineProps) {
  if (moments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">A rotina de {name} ainda está em preparação.</p>
    );
  }

  return (
    <ol className="relative flex flex-col gap-8 border-l border-border pl-6">
      {moments.map((moment) => (
        <li key={moment.time} className="relative">
          <span className="absolute top-1 -left-[1.6rem] size-2.5 rounded-full bg-primary" />
          <span className="font-mono text-xs text-primary">{moment.time}</span>
          <h3 className="mt-1 text-lg text-foreground">{moment.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{moment.description}</p>
        </li>
      ))}
    </ol>
  );
}
