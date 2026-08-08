import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

import bergamoHero from "@/assets/bergamo/hero.jpg";
import { ArsenalLogo } from "@/components/brand/ArsenalLogo";
import { bergamoImage } from "@/data/bergamoAssets";

export interface AuthExperienceShellProps {
  badge: string;
  title: string;
  description: string;
  contextLabel?: string;
  highlights?: string[];
  children: React.ReactNode;
}

/**
 * Shared Bergamo-branded shell for every step that a customer sees while
 * activating or recovering access. Only public preview imagery is used here.
 */
export function AuthExperienceShell({
  badge,
  title,
  description,
  contextLabel = "Área do aluno",
  highlights = [],
  children,
}: AuthExperienceShellProps) {
  return (
    <div className="bergamo-theme relative min-h-svh overflow-hidden bg-background font-sans text-foreground antialiased">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={bergamoHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[62%_35%] opacity-55 saturate-[0.85]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_93%,transparent)_42%,color-mix(in_oklab,var(--background)_42%,transparent)_76%,var(--background)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_38%,transparent)_0%,var(--background)_100%)]" />
        <div className="absolute -top-36 -right-32 size-[34rem] rounded-full bg-primary/35 blur-[130px]" />
        <div className="absolute -bottom-48 left-[28%] size-[30rem] rounded-full bg-secondary/55 blur-[150px]" />

        <div className="absolute top-[12%] right-[7%] hidden w-44 rotate-[5deg] overflow-hidden rounded-[1.75rem] border border-white/15 bg-card/70 p-2 shadow-2xl shadow-black/50 xl:block">
          <img
            src={bergamoImage("01")}
            alt=""
            className="aspect-[4/5] w-full rounded-[1.25rem] object-cover"
          />
        </div>
        <div className="absolute right-[23%] bottom-[7%] hidden w-40 -rotate-[6deg] overflow-hidden rounded-[1.75rem] border border-primary/35 bg-card/70 p-2 shadow-2xl shadow-black/50 xl:block">
          <img
            src={bergamoImage("26")}
            alt=""
            className="aspect-[4/5] w-full rounded-[1.25rem] object-cover"
          />
        </div>
        <div className="absolute inset-0 opacity-[0.07] grain" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12 lg:py-7">
        <Link
          to="/bergamo"
          className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArsenalLogo className="w-28 drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)] sm:w-36" />
        </Link>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-white/65 uppercase backdrop-blur-xl sm:text-xs">
          {contextLabel}
        </span>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 pt-8 pb-12 sm:px-8 lg:min-h-[calc(100svh-96px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.62fr)] lg:items-center lg:gap-16 lg:px-12 lg:pt-2 lg:pb-20">
        <section className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-xl">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            {badge}
          </div>
          <h1 className="mt-6 max-w-xl font-display text-[2.65rem] leading-[0.94] tracking-[-0.045em] text-balance text-white sm:text-5xl lg:text-[4.35rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {description}
          </p>

          {highlights.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-snug text-white/80 backdrop-blur-xl"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
          <div className="absolute -inset-px rounded-[2rem] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_70%,transparent),transparent_42%,color-mix(in_oklab,var(--secondary)_75%,transparent))] opacity-80 blur-[1px]" />
          <div className="relative rounded-[2rem] border border-white/10 bg-[color-mix(in_oklab,var(--card)_88%,transparent)] p-5 shadow-[0_32px_100px_-28px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-7">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
