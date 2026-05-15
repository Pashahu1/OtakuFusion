import { unstable_cache } from 'next/cache';
import {
  crysolineAnilibertySources,
  type CrysolineAnilibertySourcesPayload,
} from '@/server/crysoline/anilibertyClient';

export async function getAnilibertySourcesCached(
  releaseId: string,
  episodeId: string
): Promise<CrysolineAnilibertySourcesPayload> {
  const sid = releaseId.trim();
  const eid = episodeId.trim();
  if (!sid || !eid) {
    return { sources: [] };
  }

  return unstable_cache(
    async () => crysolineAnilibertySources(sid, eid),
    ['crysoline-aniliberty-sources', sid, eid],
    { revalidate: 45 }
  )();
}
