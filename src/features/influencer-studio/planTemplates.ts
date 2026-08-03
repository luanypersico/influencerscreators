import type { StudioContentActionId, StudioPlanBeat } from "@/features/influencer-studio/types";
import type { RoutineMoment } from "@/features/influencers/types";

/**
 * Turns (content type + format count) into a beat-by-beat plan preview.
 *
 * This is a fixed, illustrative template — not a real generation plan. It
 * exists so a visitor can see the *shape* of what the studio will one day
 * produce automatically, without any prompt or model ever being involved.
 */

const STORY_MIDDLE = ["Aproximação", "Produto", "Demonstração"];

function storyBeats(count: number): StudioPlanBeat[] {
  const n = Math.max(2, count);
  const beats: StudioPlanBeat[] = [
    { title: "Contexto", description: "Abre o momento, sem pressa." },
  ];
  for (let i = 0; i < n - 2; i++) {
    const label = STORY_MIDDLE[i % STORY_MIDDLE.length] ?? "Aproximação";
    beats.push({ title: label, description: `Story de ${label.toLowerCase()}.` });
  }
  beats.push({ title: "CTA", description: "Fecha com um chamado claro para a ação." });
  return beats.map((beat, i) => ({ ...beat, title: `Story ${i + 1} — ${beat.title}` }));
}

function sliceTemplate(
  labels: { title: string; description: string }[],
  count: number,
): StudioPlanBeat[] {
  return labels.slice(0, Math.max(1, Math.min(count, labels.length)));
}

export const FORMAT_RANGE: Record<
  StudioContentActionId,
  { min: number; max: number; default: number }
> = {
  stories: { min: 3, max: 7, default: 5 },
  feed: { min: 1, max: 3, default: 1 },
  ugc: { min: 2, max: 4, default: 3 },
  tiktok_shop: { min: 2, max: 3, default: 2 },
  review: { min: 3, max: 4, default: 4 },
  look_of_day: { min: 1, max: 3, default: 2 },
  routine: { min: 2, max: 4, default: 3 },
  reel: { min: 2, max: 4, default: 3 },
};

export function buildPlanBeats(
  action: StudioContentActionId,
  count: number,
  routine: RoutineMoment[],
): StudioPlanBeat[] {
  switch (action) {
    case "stories":
      return storyBeats(count);
    case "feed":
      return sliceTemplate(
        [
          {
            title: "Imagem 1 — enquadramento principal",
            description: "Foco no rosto e no produto.",
          },
          { title: "Imagem 2 — detalhe", description: "Close no produto ou no look." },
          { title: "Imagem 3 — contexto", description: "Cenário completo, mais amplo." },
        ],
        count,
      );
    case "ugc":
      return sliceTemplate(
        [
          { title: "Cena 1 — apresentação", description: "Mostra o produto pela primeira vez." },
          { title: "Cena 2 — uso do produto", description: "Demonstra o produto em uso real." },
          { title: "Cena 3 — detalhe", description: "Close em textura, resultado ou embalagem." },
          {
            title: "Cena 4 — opinião final",
            description: "Conclusão sincera, sem roteiro decorado.",
          },
        ],
        count,
      );
    case "tiktok_shop":
      return sliceTemplate(
        [
          { title: "Gancho", description: "Primeiros 2 segundos prendendo atenção." },
          {
            title: "Demonstração do produto",
            description: "Mostra o produto resolvendo algo real.",
          },
          { title: "Preço e CTA", description: "Fecha com preço e chamada para comprar." },
        ],
        count,
      );
    case "review":
      return sliceTemplate(
        [
          { title: "Introdução", description: "Contexto: o que é e por que está testando." },
          { title: "Prós", description: "O que realmente funcionou." },
          { title: "Contras", description: "O que não agradou, com honestidade." },
          { title: "Nota final", description: "Resumo e recomendação." },
        ],
        count,
      );
    case "look_of_day":
      return sliceTemplate(
        [
          { title: "Look completo", description: "Corpo inteiro, enquadramento editorial." },
          { title: "Detalhe do look", description: "Close em peça, acessório ou tecido." },
          { title: "Styling", description: "Como compor a peça de outras formas." },
        ],
        count,
      );
    case "reel":
      return sliceTemplate(
        [
          { title: "Abertura", description: "Gancho visual nos primeiros segundos." },
          { title: "Demonstração", description: "Corpo do vídeo, ritmo dinâmico." },
          { title: "Virada", description: "Um momento de surpresa ou humor." },
          { title: "CTA final", description: "Fecha com chamada para ação." },
        ],
        count,
      );
    case "routine": {
      const moments = routine.slice(0, Math.max(2, Math.min(count, routine.length)));
      if (moments.length === 0) {
        return [
          { title: "Rotina", description: "A rotina desta personagem ainda está em preparação." },
        ];
      }
      return moments.map((moment) => ({
        title: `${moment.time} — ${moment.title}`,
        description: moment.description,
      }));
    }
    default:
      return [];
  }
}
