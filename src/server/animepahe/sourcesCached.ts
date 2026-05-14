import { unstable_cache } from 'next/cache';
import {
  crysolineAnimepaheSources,
  type CrysolineAnimepaheSourcesPayload,
} from '@/server/crysoline/animepaheClient';

export async function getAnimePaheSourcesCached(
  seriesId: string,
  episodeHash: string
): Promise<CrysolineAnimepaheSourcesPayload> {
  const sid = seriesId.trim();
  const eid = episodeHash.trim();
  if (!sid || !eid) {
    return { headers: {}, sources: [] };
  }

  return unstable_cache(
    async () => crysolineAnimepaheSources(sid, eid),
    ['crysoline-animepahe-sources', sid, eid],
    { revalidate: 45 }
  )();
}
