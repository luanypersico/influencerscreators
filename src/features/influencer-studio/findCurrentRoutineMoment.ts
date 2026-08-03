import type { RoutineMoment } from "@/features/influencers/types";

/** Picks the routine moment that most recently started relative to `hour`, falling back to the first. */
export function findCurrentRoutineMoment(
  routine: RoutineMoment[],
  hour: number,
): RoutineMoment | undefined {
  if (routine.length === 0) return undefined;

  const sorted = [...routine].sort((a, b) => a.time.localeCompare(b.time));
  const current = [...sorted].reverse().find((moment) => parseHour(moment.time) <= hour);
  return current ?? sorted[0];
}

function parseHour(time: string): number {
  const [hoursText] = time.split(":");
  const hours = Number(hoursText);
  return Number.isFinite(hours) ? hours : 0;
}
