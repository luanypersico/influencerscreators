import { SectionTitle } from "@/components/site/SectionTitle";

const PILLARS = [
  {
    title: "Identidade",
    body: "Nome, história e traços que fazem dela uma pessoa, não uma imagem solta.",
  },
  {
    title: "Personalidade",
    body: "Jeito de falar, valores e humor consistentes em cada publicação.",
  },
  { title: "Rotina", body: "Uma vida-base que dá continuidade real ao conteúdo, dia após dia." },
  {
    title: "Universo visual",
    body: "Cenários, looks e luz que mantêm a mesma pessoa reconhecível.",
  },
  { title: "Linguagem", body: "Um tom de voz próprio, ajustado ao público que ela representa." },
  {
    title: "Continuidade",
    body: "Conteúdo novo sem perder quem ela é — nada de reconstruir do zero.",
  },
];

export function MoreThanAFaceSection() {
  return (
    <section className="border-t border-border px-6 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          kicker="Não é um gerador"
          title="Mais que um rosto"
          subtitle="Isso não é uma imagem aleatória de IA. É um personagem completo, pronto para trabalhar."
        />

        <div className="studio-surface mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="bg-background p-6">
              <h3 className="text-xl leading-tight">{pillar.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
