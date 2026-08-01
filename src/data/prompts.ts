/**
 * Curated prompt library for photorealistic AI influencer generation.
 *
 * Every prompt is written in English on purpose: image models (NanoBanana Pro,
 * GPT Image, Flux, Midjourney) are trained overwhelmingly on English captions,
 * so English yields measurably tighter adherence than Portuguese.
 */

export interface Prompt {
  /** Stable slug, used as React key and copy-analytics id. */
  id: string;
  title: string;
  /** Portuguese one-liner: what this prompt is for. */
  description: string;
  category: CategoryId;
  /** Searchable free-form tags (lowercase, no accents). */
  tags: string[];
  /** The prompt itself, ready to paste. */
  prompt: string;
}

export type CategoryId =
  | "retrato"
  | "selfie"
  | "ugc"
  | "lifestyle"
  | "fitness"
  | "moda"
  | "viagem"
  | "video";

export interface Category {
  id: CategoryId;
  label: string;
  hint: string;
}

export const CATEGORIES: Category[] = [
  { id: "retrato", label: "Retrato", hint: "Close, pele e olhar" },
  { id: "selfie", label: "Selfie", hint: "Frontal, câmera na mão" },
  { id: "ugc", label: "UGC / Review", hint: "Vender produto" },
  { id: "lifestyle", label: "Lifestyle", hint: "Rotina e cenário" },
  { id: "fitness", label: "Fitness", hint: "Academia e corpo" },
  { id: "moda", label: "Moda", hint: "Look e editorial" },
  { id: "viagem", label: "Viagem", hint: "Locação e luz natural" },
  { id: "video", label: "Vídeo", hint: "Movimento e câmera" },
];