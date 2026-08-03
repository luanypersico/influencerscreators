import type { PublicInfluencer } from "@/features/influencers/types";

export interface PersonalitySectionProps {
  influencer: PublicInfluencer;
}

/** "Quem é ela?" — personality, communication style, audience, compatible niches. */
export function PersonalitySection({ influencer }: PersonalitySectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Field label="Personalidade">
        {influencer.personalityTraits.length > 0 ? influencer.personalityTraits.join(", ") : "—"}
      </Field>
      <Field label="Comunicação">{influencer.communicationStyle}</Field>
      <Field label="Conteúdo">
        {influencer.contentPillars.length > 0 ? influencer.contentPillars.join(", ") : "—"}
      </Field>
      <Field label="Público">{influencer.audience}</Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[0.65rem] font-semibold tracking-[0.16em] text-primary uppercase">
        {label}
      </span>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">{children}</p>
    </div>
  );
}
