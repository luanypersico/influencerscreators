import { useState } from "react";

import { SectionTitle } from "@/components/site/SectionTitle";
import { ContentPlanDialog } from "@/features/influencer-studio/components/ContentPlanDialog";
import { STUDIO_CONTENT_ACTIONS } from "@/features/influencer-studio/data/studioDemoRecords";
import type {
  InfluencerOperationalProfile,
  StudioContentAction,
} from "@/features/influencer-studio/types";

export interface CreateTodaySectionProps {
  name: string;
  operational: InfluencerOperationalProfile;
}

/** "O que a Mari vai criar hoje?" — the action grid that opens the demonstrative planning flow. */
export function CreateTodaySection({ name, operational }: CreateTodaySectionProps) {
  const [selected, setSelected] = useState<StudioContentAction | null>(null);

  return (
    <section className="border-b border-border px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          kicker="Estúdio"
          title={`O que ${name} vai criar hoje?`}
          subtitle="Escolha um formato para ver como seria planejar esse conteúdo com ela."
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {STUDIO_CONTENT_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => setSelected(action)}
              className="flex flex-col items-start gap-1 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="text-sm font-medium text-foreground">{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <ContentPlanDialog
        action={selected}
        onClose={() => setSelected(null)}
        influencerName={name}
        associatedProducts={operational.associatedProducts}
        routine={operational.routine}
      />
    </section>
  );
}
