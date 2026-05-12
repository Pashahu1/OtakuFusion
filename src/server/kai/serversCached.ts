import 'server-only';

import { unstable_cache } from 'next/cache';
import { animekaiApi } from '@/lib/animekai-api';
import {
  mapKaiServersPayloadToServerInfo,
  type KaiServersPayload,
} from '@/services/kai/serverMapping';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

const SERVERS_CACHE_SECONDS = 5 * 60;

function isSafeEpisodeToken(value: string): boolean {
  const t = value.trim();
  if (t.length < 2 || t.length > 512) return false;
  if (/[\u0000-\u0020<>"]/.test(t)) return false;
  return true;
}

export async function getAnimeKaiServersCached(epToken: string): Promise<ServerInfo[]> {
  const key = epToken.trim();
  if (!key) return [];
  if (!isSafeEpisodeToken(key)) return [];

  const fetcher = unstable_cache(
    async (): Promise<ServerInfo[]> => {
      const data = await animekaiApi.get<KaiServersPayload>(
        `/api/servers/${encodeURIComponent(key)}`
      );
      return mapKaiServersPayloadToServerInfo(data);
    },
    ['kai-servers-v1', key],
    { revalidate: SERVERS_CACHE_SECONDS }
  );

  return fetcher();
}
