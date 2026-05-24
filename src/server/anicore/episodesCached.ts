import { unstable_cache } from 'next/cache';
import {
  crysolineAnicoreEpisodes,
  type CrysolineAnicoreEpisodeRow,
} from '@/server/crysoline/anicoreClient';
import { mapCrysolineAnicoreEpisodes } from '@/services/anicore/mapCrysolineAnicoreEpisodes';
import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export async function getAnicoreEpisodeRowsCached(
  seriesId: string
): Promise<CrysolineAnicoreEpisodeRow[]> {
  const id = seriesId.trim();
  if (!id) return [];

  return unstable_cache(
    async () => crysolineAnicoreEpisodes(id),
    ['crysoline-anicore-episode-rows', id],
    { revalidate: 120 }
  )();
}

export async function getAnicoreEpisodesCached(seriesId: string): Promise<GetEpisodesResult> {
  const id = seriesId.trim();
  if (!id) return { episodes: [], totalEpisodes: 0 };

  return unstable_cache(
    async () => {
      const rows = await crysolineAnicoreEpisodes(id);
      return mapCrysolineAnicoreEpisodes(rows);
    },
    ['crysoline-anicore-episodes', id],
    { revalidate: 120 }
  )();
}
