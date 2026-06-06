import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export interface VerifiedLibertyMapping {
  libertyId: string;
}

export interface VerifiedHikkaMapping {
  hikkaSlug: string;
}

export interface VerifiedAnikotoMapping {
  anikotoSlug: string;
}

export interface CachedLibertyEpisodesPayload {
  libertyId: string;
  episodes: EpisodesTypes[];
  totalEpisodes: number;
  savedAt: number;
}
