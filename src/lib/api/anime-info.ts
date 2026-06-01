import {
  getAniListMediaById,
  mapAniListMediaToAnimeDetails,
  mapAniListMediaToNextEpisodeSchedule,
} from '@/lib/anilist';
import type { AnimeResults } from '@/shared/types/animeDetailsTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

export interface WatchAnimeCatalogMeta {
  results: AnimeResults;
  nextEpisodeSchedule: NextEpisodeScheduleResult;
}

/** Single AniList Media query for watch catalog (metadata + next-airing). */
export async function getWatchAnimeCatalogMeta(
  id: string
): Promise<WatchAnimeCatalogMeta> {
  const media = await getAniListMediaById(id);
  return {
    results: mapAniListMediaToAnimeDetails(media),
    nextEpisodeSchedule: mapAniListMediaToNextEpisodeSchedule(media),
  };
}
