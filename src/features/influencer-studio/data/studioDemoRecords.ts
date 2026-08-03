import { findInfluencerBySlug } from "@/features/influencers/data/publicInfluencers";
import type {
  InfluencerMasterRecord,
  StudioContentAction,
} from "@/features/influencer-studio/types";

/**
 * Demonstrative studio records only. The public half is reused straight
 * from the catalog (single source of truth); the operational half adds only
 * safe, descriptive demo content — never a real prompt, identity lock, or
 * generation setting. See types.ts for what's deliberately excluded.
 */
function buildMariRecord(): InfluencerMasterRecord | undefined {
  const mari = findInfluencerBySlug("mari");
  if (!mari) return undefined;

  return {
    publicProfile: mari,
    operational: {
      personalityTraits: mari.personalityTraits,
      communicationStyle: mari.communicationStyle,
      voiceNote: "Frases curtas, tom de amiga, emojis pontuais — nunca institucional.",
      signaturePhrases: ["gente, olha que máximo", "eu vou ser bem sincera com vocês"],
      routine: mari.routineMoments,
      recurringEnvironments: [
        "Cozinha de manhã",
        "Quarto — espelho e closet",
        "Sala com luz de janela",
        "Rua perto de casa",
      ],
      wardrobe: ["Look casual de manhã", "Produção leve para conteúdo de produto", "Look de saída"],
      contentPillars: mari.contentPillars.map((pillar) => ({
        label: pillar,
        description: `Conteúdo de ${pillar.toLowerCase()} no tom da Mari.`,
      })),
      audience: mari.audience,
      commercialRestrictions: [
        "Não associar a bebidas alcoólicas",
        "Não associar a apostas ou jogos de azar",
      ],
      associatedProducts: ["Produto de beleza (demo)", "Produto de skincare (demo)"],
      continuityNotes: [
        "Evitar repetir o mesmo look em publicações consecutivas.",
        "Manter o mesmo cenário dentro de uma sequência de Stories.",
        "Não contradizer a rotina já estabelecida no perfil.",
      ],
      memoryPreview: {
        note: "Em uma próxima etapa, o estúdio vai lembrar do que já foi criado. Hoje isso é só uma prévia conceitual — nenhuma memória real existe ainda.",
        examples: [
          "Últimos looks utilizados",
          "Cenários já usados essa semana",
          "Produtos em campanha ativa",
          "Conteúdos aprovados e descartados",
        ],
      },
    },
  };
}

export const STUDIO_DEMO_RECORDS: InfluencerMasterRecord[] = [buildMariRecord()].filter(
  (record): record is InfluencerMasterRecord => record !== undefined,
);

export function findStudioRecordBySlug(slug: string): InfluencerMasterRecord | undefined {
  return STUDIO_DEMO_RECORDS.find((record) => record.publicProfile.slug === slug);
}

export const STUDIO_CONTENT_ACTIONS: StudioContentAction[] = [
  { id: "stories", label: "Stories de hoje", hint: "Sequência curta para o dia" },
  { id: "feed", label: "Foto para o feed", hint: "Uma publicação de destaque" },
  { id: "ugc", label: "UGC com produto", hint: "Vídeo ou foto de review" },
  { id: "tiktok_shop", label: "TikTok Shop", hint: "Conteúdo com foco em venda" },
  { id: "review", label: "Review", hint: "Opinião sincera sobre um produto" },
  { id: "look_of_day", label: "Look do dia", hint: "Produção de moda do dia" },
  { id: "routine", label: "Rotina", hint: "Um momento do dia a dia" },
  { id: "reel", label: "Reel", hint: "Vídeo curto com movimento" },
];
