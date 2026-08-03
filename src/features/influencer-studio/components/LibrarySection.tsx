import { SectionTitle } from "@/components/site/SectionTitle";
import { ContentShowcaseTabs } from "@/features/influencers/components/ContentShowcaseTabs";
import type { SampleContent } from "@/features/influencers/types";

export interface LibrarySectionProps {
  name: string;
  sampleContent: SampleContent | undefined;
}

/** Demonstrative content library — browsable only, nothing here can be downloaded. */
export function LibrarySection({ name, sampleContent }: LibrarySectionProps) {
  return (
    <section className="px-6 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          kicker="Biblioteca"
          title="Exemplos já produzidos"
          subtitle="Organizados por formato — só para navegar, sem download."
        />
        <div className="mt-8">
          <ContentShowcaseTabs sampleContent={sampleContent} name={name} />
        </div>
      </div>
    </section>
  );
}
