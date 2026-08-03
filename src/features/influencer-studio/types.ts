import type { PublicInfluencer, RoutineMoment } from "@/features/influencers/types";

/**
 * The "ficha-mãe" (master record) for operating an influencer's studio.
 *
 * Deliberately split in two, matching where each half will eventually live:
 *
 *  - `publicProfile` reuses the existing catalog type — it's the same data
 *    already safe to ship to the browser (see features/influencers/types.ts).
 *  - `operational` is the private data model a real influencer will have
 *    once the studio has a backend. This round defines its SHAPE only, and
 *    fills demo instances with prose that's safe to show, never prompts.
 *
 * The most sensitive concepts — canonical visual identity, physical marks,
 * official references, generation presets — are typed as `never`, not left
 * empty. That makes it a type error (not a policy) for this codebase to
 * ever hold a real value for them; they only start existing once the
 * private studio backend defines its own, separate, non-public type.
 */

export interface StudioContentPillar {
  label: string;
  description: string;
}

/** Conceptual preview of a memory system that does not exist yet. */
export interface StudioMemoryPreview {
  note: string;
  examples: string[];
}

export interface InfluencerOperationalProfile {
  personalityTraits: string[];
  communicationStyle: string;
  voiceNote: string;
  signaturePhrases: string[];
  routine: RoutineMoment[];
  recurringEnvironments: string[];
  wardrobe: string[];
  contentPillars: StudioContentPillar[];
  audience: string;
  commercialRestrictions: string[];
  associatedProducts: string[];
  continuityNotes: string[];
  memoryPreview: StudioMemoryPreview;

  /** Private-studio-only. Never populated in this codebase — see file header. */
  canonicalVisualIdentity?: never;
  physicalMarks?: never;
  officialReferences?: never;
  generationPresets?: never;
}

export interface InfluencerMasterRecord {
  publicProfile: PublicInfluencer;
  operational: InfluencerOperationalProfile;
}

export type StudioContentActionId =
  "stories" | "feed" | "ugc" | "tiktok_shop" | "review" | "look_of_day" | "routine" | "reel";

export interface StudioContentAction {
  id: StudioContentActionId;
  label: string;
  hint: string;
}

export type StudioTone = "casual" | "educational" | "commercial";

export interface StudioPlanBeat {
  title: string;
  description: string;
}
