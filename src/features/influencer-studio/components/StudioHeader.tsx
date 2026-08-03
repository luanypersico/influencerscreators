import { Link } from "@tanstack/react-router";

import { hasRealPhoto, type PublicInfluencer } from "@/features/influencers/types";
import { PlaceholderArt } from "@/features/influencers/components/PlaceholderArt";
import type { TodayContext } from "@/features/influencer-studio/useTodayContext";

export interface StudioHeaderProps {
  profile: PublicInfluencer;
  today: TodayContext | null;
}

export function StudioHeader({ profile, today }: StudioHeaderProps) {
  const revealed = hasRealPhoto(profile);

  return (
    <header className="border-b border-border px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-center">
        <div className="grain size-20 shrink-0 overflow-hidden rounded-2xl border border-border sm:size-24">
          {revealed ? (
            <img
              src={profile.coverImage}
              alt={profile.name}
              width={200}
              height={200}
              className="size-full object-cover"
            />
          ) : (
            <PlaceholderArt
              variant={profile.placeholderVariant}
              initial={profile.name[0] ?? "?"}
              className="size-full"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/50 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-primary uppercase">
              Demonstração do estúdio
            </span>
            <span className="text-xs tracking-wide text-muted-foreground uppercase">
              {profile.niches.join(" · ")}
            </span>
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl">{profile.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {today
              ? `${today.greeting}, ${profile.name}! Hoje é ${today.weekdayLabel}.`
              : `Bem-vinda ao seu estúdio, ${profile.name}.`}
          </p>
        </div>

        <Link
          to="/influencers/$slug"
          params={{ slug: profile.slug }}
          className="shrink-0 self-start rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:self-center"
        >
          ← Voltar ao perfil
        </Link>
      </div>
    </header>
  );
}
