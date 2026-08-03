/**
 * Public-facing influencer domain types.
 *
 * Everything here is demonstrative content for the public storefront —
 * identity, personality, routine, content pillars — never prompts, identity
 * locks, canonical references or generation settings. Those stay private to
 * the (not yet built) studio.
 */

export type InfluencerStatus = "available" | "reserved" | "sold" | "coming_soon";

/** One of the fixed abstract treatments PlaceholderArt renders for coming_soon cards. */
export type PlaceholderVariant = 1 | 2 | 3 | 4 | 5 | 6;

export interface RoutineMoment {
  /** e.g. "07:30" */
  time: string;
  title: string;
  description: string;
  imageKey?: string;
}

export interface SampleContentItem {
  imageKey?: string;
  caption?: string;
}

export interface SampleContent {
  feed: SampleContentItem[];
  stories: SampleContentItem[];
  reels: SampleContentItem[];
  ugc: SampleContentItem[];
}

interface PublicInfluencerBase {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  publicBio: string;
  apparentAge: number;
  city: string;
  niches: string[];
  personalityTraits: string[];
  communicationStyle: string;
  audience: string;
  contentPillars: string[];
  routineMoments: RoutineMoment[];
  /** Stories, Feed, Reels, UGC, TikTok Shop, Reviews, Anúncios... */
  contentFormats: string[];
  status: InfluencerStatus;
  /** A label, never a committed number — e.g. "Sob consulta". */
  publicPriceLabel: string;
  whatIsIncluded: string[];
  featured: boolean;
  /** Always true this round — every entry here is demonstrative content. */
  demo: true;
}

/** A fully fleshed-out profile: has real cover/gallery/sample content. */
export interface RevealedInfluencer extends PublicInfluencerBase {
  coverImage: string;
  gallery: string[];
  sampleContent: SampleContent;
  placeholderVariant?: never;
}

/** A "coming soon" catalog slot: no photography, an abstract placeholder instead. */
export interface ComingSoonInfluencer extends PublicInfluencerBase {
  status: "coming_soon";
  coverImage?: never;
  gallery: never[];
  sampleContent?: never;
  placeholderVariant: PlaceholderVariant;
}

export type PublicInfluencer = RevealedInfluencer | ComingSoonInfluencer;

export function hasRealPhoto(influencer: PublicInfluencer): influencer is RevealedInfluencer {
  return influencer.status !== "coming_soon";
}
