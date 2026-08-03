import { Link } from "@tanstack/react-router";

import { PlaceholderArt } from "@/features/influencers/components/PlaceholderArt";
import { StatusChip } from "@/features/influencers/components/StatusChip";
import { hasRealPhoto, type PublicInfluencer } from "@/features/influencers/types";
import { cn } from "@/lib/utils";

export interface InfluencerCardProps {
  influencer: PublicInfluencer;
  className?: string;
}

/** Used in the catalog grid and the home "featured" teaser — one card, one look everywhere. */
export function InfluencerCard({ influencer, className }: InfluencerCardProps) {
  const revealed = hasRealPhoto(influencer);

  return (
    <Link
      to="/influencers/$slug"
      params={{ slug: influencer.slug }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors",
        "hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {revealed ? (
          <img
            src={influencer.coverImage}
            alt={`${influencer.name} — ${influencer.tagline}`}
            width={1024}
            height={1280}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <PlaceholderArt
            variant={influencer.placeholderVariant}
            initial={influencer.name[0] ?? "?"}
            className="size-full"
          />
        )}
        <StatusChip
          status={influencer.status}
          demo={influencer.demo}
          className="absolute top-3 left-3"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div>
          <span className="text-[0.65rem] font-semibold tracking-[0.18em] text-primary uppercase">
            {influencer.niches.join(" · ")}
          </span>
          <h3 className="mt-1 text-xl leading-tight text-card-foreground">{influencer.name}</h3>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{influencer.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="text-muted-foreground">
            {influencer.demo && influencer.status === "available"
              ? "Perfil demonstrativo"
              : influencer.publicPriceLabel}
          </span>
          <span className="font-medium text-primary">Conhecer {influencer.name} →</span>
        </div>
      </div>
    </Link>
  );
}
