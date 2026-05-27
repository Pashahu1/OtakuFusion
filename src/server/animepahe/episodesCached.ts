import { unstable_cache } from 'next/cache';
import { crysolineAnimepaheEpisodes } from '@/server/crysoline/animepaheClient';
import { mapCrysolineAnimepaheEpisodes } from '@/services/animepahe/mapCrysolineEpisodes';
import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export async function getAnimePaheEpisodesCached(
  seriesId: string
): Promise<GetEpisodesResult> {
  const id = seriesId.trim();
  if (!id) return { episodes: [], totalEpisodes: 0 };

  return unstable_cache(
    async () => {
      const rows = await crysolineAnimepaheEpisodes(id);
      return mapCrysolineAnimepaheEpisodes(rows);
    },
    ['crysoline-animepahe-episodes', id],
    { revalidate: 120 }
  )();
}
