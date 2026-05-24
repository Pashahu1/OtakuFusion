import { unstable_cache } from 'next/cache';
import {
  crysolineAnicoreSources,
  type CrysolineAnicoreSourcesPayload,
} from '@/server/crysoline/anicoreClient';

export async function getAnicoreSourcesCached(
  seriesId: string,
  episodeId: string,
  server: string,
  lang?: 'sub' | 'dub'
): Promise<CrysolineAnicoreSourcesPayload> {
  const sid = seriesId.trim();
  const eid = episodeId.trim();
  const srv = server.trim();
  const subType = lang === 'dub' ? 'dub' : lang === 'sub' ? 'sub' : undefined;
  if (!sid || !eid || !srv) {
    return { headers: {}, sources: [] };
  }

  return unstable_cache(
    async () =>
      crysolineAnicoreSources(sid, eid, {
        server: srv,
        subType,
      }),
    ['crysoline-anicore-sources', sid, eid, srv, subType ?? ''],
    { revalidate: 45 }
  )();
}
