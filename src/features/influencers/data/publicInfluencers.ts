import heroAi from "@/assets/hero-ai.jpg";
import heroPortrait from "@/assets/hero-portrait.jpg";
import type { PublicInfluencer } from "@/features/influencers/types";

/**
 * Central, demonstrative source of public influencer content.
 *
 * Everything here is placeholder content built to validate the interface —
 * no real sales, no committed pricing, no third-party photography. Replace
 * wholesale once the catalog has real, revealed characters.
 *
 * Never add prompts, identity locks, canonical references or generation
 * settings here — this file is public.
 */
export const PUBLIC_INFLUENCERS: PublicInfluencer[] = [
  {
    id: "mari",
    slug: "mari",
    name: "Mari",
    tagline: "Lifestyle, beleza e TikTok Shop",
    publicBio:
      "Nordestina, divertida e com uma comunicação de amiga que mostra aquilo que realmente usa.",
    apparentAge: 26,
    city: "Recife, PE",
    niches: ["Lifestyle", "Beleza", "TikTok Shop"],
    personalityTraits: ["Curiosa", "Divertida", "Próxima", "Confiável"],
    communicationStyle: "Fala como amiga, com leve sotaque nordestino.",
    audience: "Mulheres de 20 a 38 anos.",
    contentPillars: ["Lifestyle", "Beleza", "Rotina", "Moda acessível", "TikTok Shop"],
    routineMoments: [
      {
        time: "07:30",
        title: "Café na cozinha",
        description: "Começa o dia com calma, luz de manhã e o primeiro café.",
      },
      {
        time: "09:00",
        title: "Escolhendo o look",
        description: "Decide o que vestir pensando no que vai gravar.",
      },
      {
        time: "11:30",
        title: "Conteúdo de produto",
        description: "Grava a apresentação de um produto do dia.",
      },
      {
        time: "15:00",
        title: "Saída para resolver coisas",
        description: "Sai de casa — compromissos reais, conteúdo de rua.",
      },
      {
        time: "19:00",
        title: "Rotina em casa",
        description: "Volta pra casa, relaxa, prepara o jantar.",
      },
      {
        time: "21:00",
        title: "Conversa com seguidores",
        description: "Responde comentários e grava stories mais espontâneos.",
      },
    ],
    contentFormats: ["Stories", "Feed", "Reels", "UGC", "TikTok Shop", "Anúncios"],
    status: "available",
    publicPriceLabel: "Sob consulta",
    coverImage: heroPortrait,
    gallery: [heroPortrait, heroAi],
    sampleContent: {
      feed: [
        { imageKey: heroPortrait, caption: "Retrato editorial — luz de fim de tarde." },
        { imageKey: heroAi, caption: "Still de rotina — luz de janela." },
      ],
      stories: [
        { imageKey: heroPortrait, caption: "Story 1 — contexto do dia." },
        { imageKey: heroAi, caption: "Story 2 — bastidor de produto." },
      ],
      reels: [{ imageKey: heroPortrait, caption: "Frame de abertura de um reel de rotina." }],
      ugc: [{ imageKey: heroAi, caption: "UGC — apresentação de produto em casa." }],
    },
    whatIsIncluded: [
      "Identidade e personagem exclusiva",
      "Referências visuais oficiais",
      "Personalidade e linguagem definidas",
      "Universo visual e cenários-base",
      "Rotina-base para continuidade",
      "Biblioteca inicial de conteúdo",
      "Acesso futuro ao estúdio de criação",
    ],
    featured: true,
    demo: true,
  },
  {
    id: "bia",
    slug: "bia",
    name: "Bia",
    tagline: "Moda e estilo do dia a dia",
    publicBio: "Personagem em preparação — moda acessível e composição de looks.",
    apparentAge: 24,
    city: "A definir",
    niches: ["Moda"],
    personalityTraits: ["Em definição"],
    communicationStyle: "A definir.",
    audience: "A definir.",
    contentPillars: ["Moda", "Looks", "Estilo pessoal"],
    routineMoments: [],
    contentFormats: ["Feed", "Reels"],
    status: "coming_soon",
    publicPriceLabel: "Em breve",
    placeholderVariant: 1,
    gallery: [],
    whatIsIncluded: ["Identidade e personagem exclusiva", "Acesso futuro ao estúdio de criação"],
    featured: false,
    demo: true,
  },
  {
    id: "nanda",
    slug: "nanda",
    name: "Nanda",
    tagline: "Fitness e rotina saudável",
    publicBio: "Personagem em preparação — treino, disposição e rotina ativa.",
    apparentAge: 27,
    city: "A definir",
    niches: ["Fitness"],
    personalityTraits: ["Em definição"],
    communicationStyle: "A definir.",
    audience: "A definir.",
    contentPillars: ["Treino", "Rotina", "Disposição"],
    routineMoments: [],
    contentFormats: ["Stories", "Reels"],
    status: "coming_soon",
    publicPriceLabel: "Em breve",
    placeholderVariant: 2,
    gallery: [],
    whatIsIncluded: ["Identidade e personagem exclusiva", "Acesso futuro ao estúdio de criação"],
    featured: false,
    demo: true,
  },
  {
    id: "duda",
    slug: "duda",
    name: "Duda",
    tagline: "Culinária afetiva e receitas do dia a dia",
    publicBio: "Personagem em preparação — receitas simples e cozinha de verdade.",
    apparentAge: 29,
    city: "A definir",
    niches: ["Culinária"],
    personalityTraits: ["Em definição"],
    communicationStyle: "A definir.",
    audience: "A definir.",
    contentPillars: ["Receitas", "Cozinha", "Dia a dia"],
    routineMoments: [],
    contentFormats: ["Reels", "UGC"],
    status: "coming_soon",
    publicPriceLabel: "Em breve",
    placeholderVariant: 3,
    gallery: [],
    whatIsIncluded: ["Identidade e personagem exclusiva", "Acesso futuro ao estúdio de criação"],
    featured: false,
    demo: true,
  },
  {
    id: "sol",
    slug: "sol",
    name: "Sol",
    tagline: "Maternidade real e rotina em família",
    publicBio: "Personagem em preparação — maternidade sem filtro e rotina real.",
    apparentAge: 31,
    city: "A definir",
    niches: ["Maternidade"],
    personalityTraits: ["Em definição"],
    communicationStyle: "A definir.",
    audience: "A definir.",
    contentPillars: ["Maternidade", "Rotina", "Família"],
    routineMoments: [],
    contentFormats: ["Stories", "Feed"],
    status: "coming_soon",
    publicPriceLabel: "Em breve",
    placeholderVariant: 4,
    gallery: [],
    whatIsIncluded: ["Identidade e personagem exclusiva", "Acesso futuro ao estúdio de criação"],
    featured: false,
    demo: true,
  },
  {
    id: "vic",
    slug: "vic",
    name: "Vic",
    tagline: "Tecnologia e produtividade no dia a dia",
    publicBio: "Personagem em preparação — tecnologia explicada de forma simples.",
    apparentAge: 25,
    city: "A definir",
    niches: ["Tecnologia"],
    personalityTraits: ["Em definição"],
    communicationStyle: "A definir.",
    audience: "A definir.",
    contentPillars: ["Tecnologia", "Produtividade", "Reviews"],
    routineMoments: [],
    contentFormats: ["Reviews", "Reels"],
    status: "coming_soon",
    publicPriceLabel: "Em breve",
    placeholderVariant: 5,
    gallery: [],
    whatIsIncluded: ["Identidade e personagem exclusiva", "Acesso futuro ao estúdio de criação"],
    featured: false,
    demo: true,
  },
];

export const ALL_NICHES = Array.from(
  new Set(PUBLIC_INFLUENCERS.flatMap((influencer) => influencer.niches)),
).sort();

export function findInfluencerBySlug(slug: string): PublicInfluencer | undefined {
  return PUBLIC_INFLUENCERS.find((influencer) => influencer.slug === slug);
}

export function getFeaturedInfluencers(): PublicInfluencer[] {
  return PUBLIC_INFLUENCERS.filter((influencer) => influencer.featured);
}
