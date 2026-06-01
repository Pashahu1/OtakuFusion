'use client';

import { useQuery } from '@tanstack/react-query';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';

export interface WatchSpotlightArtwork {
  clearLogoUrl: string | null;
  heroImageUrl: string | null;
  seasonLabel: string | null;
}

async function fetchWatchSpotlightArtwork(
  anime: AnimeData
): Promise<WatchSpotlightArtwork> {
  const params = new URLSearchParams({ title: anime.title });
  if (anime.mal_id != null && anime.mal_id > 0) {
    params.set('malId', String(anime.mal_id));
  }
  const overview = anime.animeInfo?.Overview?.trim();
  if (overview) {
    params.set('description', overview.slice(0, 280));
  }

  const res = await fetch(`/api/tvdb/spotlight-art?${params.toString()}`);
  if (!res.ok) {
    return { clearLogoUrl: null, heroImageUrl: null, seasonLabel: null };
  }
  return (await res.json()) as WatchSpotlightArtwork;
}

/** TVDB hero/logo — fetch as soon as catalog metadata is available (no AniList duplicate). */
export function useWatchSpotlightArtwork(animeInfo: AnimeData | null) {
  return useQuery({
    queryKey: [
      'watch-spotlight-art',
      animeInfo?.id,
      animeInfo?.title,
      animeInfo?.mal_id,
    ],
    queryFn: () => fetchWatchSpotlightArtwork(animeInfo!),
    enabled: Boolean(animeInfo?.title?.trim()),
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}
