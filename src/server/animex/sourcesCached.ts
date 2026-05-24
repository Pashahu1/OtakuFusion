import { unstable_cache } from 'next/cache';
import {
  crysolineAnimexSources,
  type AnimexSubType,
  type CrysolineAnimexSourcesPayload,
} from '@/server/crysoline/animexClient';

export async function getAnimexSourcesCached(
  seriesId: string,
  episodeId: string,
  server: string,
  subType: AnimexSubType
): Promise<CrysolineAnimexSourcesPayload> {
  const sid = seriesId.trim();
  const eid = episodeId.trim();
  const srv = server.trim();
  if (!sid || !eid || !srv) {
    return { headers: {}, sources: [] };
  }

  return unstable_cache(
    async () =>
      crysolineAnimexSources(sid, eid, {
        server: srv,
        subType,
      }),
    ['crysoline-animex-sources', sid, eid, srv, subType],
    { revalidate: 45 }
  )();
}
