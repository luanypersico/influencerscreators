import { useEffect, useState } from "react";

export interface TodayContext {
  weekdayLabel: string;
  timeOfDayLabel: string;
  greeting: string;
  hour: number;
}

/**
 * Client-only "what time is it" context, used for a friendly greeting and to
 * guess which routine moment is closest to now. Returns `null` until
 * mounted so server and client render identically on first paint — reading
 * the visitor's local clock during SSR would produce a value that doesn't
 * match hydration (the server's clock isn't the visitor's timezone), which
 * is exactly the class of hydration-mismatch bug to avoid here.
 */
export function useTodayContext(): TodayContext | null {
  const [context, setContext] = useState<TodayContext | null>(null);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const weekdayLabel = now.toLocaleDateString("pt-BR", { weekday: "long" });
    const timeOfDayLabel = hour < 12 ? "manhã" : hour < 18 ? "tarde" : "noite";
    const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    setContext({ weekdayLabel, timeOfDayLabel, greeting, hour });
  }, []);

  return context;
}
