import { SectionTitle } from "@/components/site/SectionTitle";
import { StatusChip } from "@/features/influencers/components/StatusChip";
import { PlaceholderArt } from "@/features/influencers/components/PlaceholderArt";

/**
 * Illustrates the exclusivity mechanic — deliberately generic and labeled as
 * an example, never a real sale count or a specific past transaction.
 */
export function SoldExclusivitySection() {
  return (
    <section className="border-t border-border px-6 py-20 md:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Exclusividade" title="Assim que é vendida, ela sai do catálogo" />
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Cada personagem é vendida uma única vez. Depois da confirmação, ela deixa de aparecer
            para outros visitantes e é vinculada só à conta de quem comprou — ninguém mais poderá
            adquiri-la.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-border opacity-70 grayscale">
          <PlaceholderArt variant={6} initial="?" className="aspect-[4/5] w-full" />
          <StatusChip status="sold" className="absolute top-3 left-3" />
          <div className="absolute inset-x-0 bottom-0 bg-background/90 p-3 text-center text-[0.65rem] tracking-wide text-muted-foreground uppercase">
            Exemplo ilustrativo
          </div>
        </div>
      </div>
    </section>
  );
}
