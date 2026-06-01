'use client';

import { useWatchAnime } from './useWatchAnime';

/** Loads anime metadata and episode catalog only (no stream / player). */
export function useWatchSeries(animeId: string, highlightEpisode?: string) {
  return useWatchAnime(animeId, highlightEpisode, 'animepahe');
}
