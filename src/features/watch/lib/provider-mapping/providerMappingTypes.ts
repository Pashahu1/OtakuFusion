import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export interface VerifiedPaheMapping {
  paheId: string;
  hasSeriesDub?: boolean;
}

export interface VerifiedLibertyMapping {
  libertyId: string;
}

export interface VerifiedHikkaMapping {
  hikkaSlug: string;
}

export interface CachedLibertyEpisodesPayload {
  libertyId: string;
  episodes: EpisodesTypes[];
  totalEpisodes: number;
  savedAt: number;
}
