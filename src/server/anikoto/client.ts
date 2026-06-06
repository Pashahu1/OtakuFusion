import { getAnikotoApiBaseUrl } from '@/server/anikoto/config';
import { anikotoGetJson } from '@/server/anikoto/anikotoFetch';
import type {
  AnikotoApiEnvelope,
  AnikotoEpisodeRow,
  AnikotoInfoData,
  AnikotoSearchRow,
  AnikotoStreamData,
} from '@/server/anikoto/types';

function withBase(path: string): URL {
  const base = getAnikotoApiBaseUrl();
  const root = base.endsWith('/') ? base : `${base}/`;
  return new URL(path.startsWith('/') ? path.slice(1) : path, root);
}

export async function anikotoInfo(
  id: string,
  signal?: AbortSignal
): Promise<AnikotoApiEnvelope<AnikotoInfoData>> {
  const url = withBase('/api/info');
  url.searchParams.set('id', id.trim());
  return anikotoGetJson<AnikotoApiEnvelope<AnikotoInfoData>>(url, 'anikoto_info', signal);
}

export async function anikotoSearch(
  keyword: string,
  signal?: AbortSignal
): Promise<AnikotoApiEnvelope<AnikotoSearchRow[]>> {
  const url = withBase('/api/search');
  url.searchParams.set('keyword', keyword.trim());
  return anikotoGetJson<AnikotoApiEnvelope<AnikotoSearchRow[]>>(
    url,
    'anikoto_search',
    signal
  );
}

export async function anikotoEpisodes(
  id: string,
  signal?: AbortSignal
): Promise<AnikotoApiEnvelope<AnikotoEpisodeRow[]>> {
  const slug = encodeURIComponent(id.trim());
  const url = withBase(`/api/episodes/${slug}`);
  return anikotoGetJson<AnikotoApiEnvelope<AnikotoEpisodeRow[]>>(
    url,
    'anikoto_episodes',
    signal
  );
}

export interface AnikotoStreamParams {
  id: string;
  ep: string;
  server: 'hd-1' | 'hd-2';
  type: 'sub' | 'dub';
}

export async function anikotoStream(
  params: AnikotoStreamParams,
  signal?: AbortSignal
): Promise<AnikotoApiEnvelope<AnikotoStreamData>> {
  const url = withBase('/api/stream');
  url.searchParams.set('id', params.id.trim());
  url.searchParams.set('ep', params.ep.trim());
  url.searchParams.set('server', params.server);
  url.searchParams.set('type', params.type);
  return anikotoGetJson<AnikotoApiEnvelope<AnikotoStreamData>>(
    url,
    'anikoto_stream',
    signal
  );
}
