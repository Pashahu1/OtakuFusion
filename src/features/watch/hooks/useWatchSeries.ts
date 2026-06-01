'use client';

import { useState } from 'react';
import { useWatchAnime } from './useWatchAnime';

/** Loads anime metadata and episode catalog only (no stream / player). */
export function useWatchSeries(animeId: string, highlightEpisode?: string) {
  const [watchStreamProvider] = useState<'animepahe'>('animepahe');
  return useWatchAnime(animeId, highlightEpisode, watchStreamProvider);
}
