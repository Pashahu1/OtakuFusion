import { unstable_cache } from 'next/cache';
import {
  crysolineAnilibertyEpisodes,
  type CrysolineAnilibertyEpisodeRow,
} from '@/server/crysoline/anilibertyClient';

export async function getAnilibertyEpisodesCached(
  releaseId: string
): Promise<CrysolineAnilibertyEpisodeRow[]> {
  const id = releaseId.trim();
  if (!id) return [];

  return unstable_cache(
    async () => crysolineAnilibertyEpisodes(id),
    ['crysoline-aniliberty-episodes', id],
    { revalidate: 120 }
  )();
}
