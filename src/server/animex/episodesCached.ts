import { unstable_cache } from 'next/cache';
import {
  crysolineAnimexEpisodes,
  type CrysolineAnimexEpisodeRow,
} from '@/server/crysoline/animexClient';
import { mapCrysolineAnimexEpisodes } from '@/services/animex/mapCrysolineAnimexEpisodes';
import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export async function getAnimexEpisodeRowsCached(
  seriesId: string
): Promise<CrysolineAnimexEpisodeRow[]> {
  const id = seriesId.trim();
  if (!id) return [];

  return unstable_cache(
    async () => crysolineAnimexEpisodes(id),
    ['crysoline-animex-episode-rows', id],
    { revalidate: 120 }
  )();
}

export async function getAnimexEpisodesCached(seriesId: string): Promise<GetEpisodesResult> {
  const id = seriesId.trim();
  if (!id) return { episodes: [], totalEpisodes: 0 };

  return unstable_cache(
    async () => {
      const rows = await crysolineAnimexEpisodes(id);
      return mapCrysolineAnimexEpisodes(rows);
    },
    ['crysoline-animex-episodes', id],
    { revalidate: 120 }
  )();
}
