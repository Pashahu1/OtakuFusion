import { getCrysolineApiBaseUrl } from '@/server/crysoline/config';
import { crysolineGetJson } from '@/server/crysoline/crysolineFetch';

export interface CrysolineAnicoreSearchRow {
  id: number;
  idAl: number;
  idMal: number;
  title: { romaji?: string; english?: string | null; native?: string };
  totalEpisodes: number;
  metadata?: { format?: string; averageScore?: number; popularity?: number };
}

export interface CrysolineAnicoreEpisodeRow {
  id: string;
  title?: string;
  number: number;
  isFiller?: boolean;
  metadata?: {
    subProviders?: string[];
    dubProviders?: string[];
    isFiller?: boolean;
  };
}

export interface CrysolineAnicoreSourceRow {
  url?: string | null;
  proxy?: string | null;
  type?: string;
  quality?: string;
}

export interface CrysolineAnicoreSubtitleRow {
  url?: string;
  srcLang?: string;
  label?: string;
}

export interface CrysolineAnicoreSourcesPayload {
  headers?: Record<string, string>;
  sources?: CrysolineAnicoreSourceRow[];
  subtitles?: CrysolineAnicoreSubtitleRow[];
}

function withBase(path: string): URL {
  const base = getCrysolineApiBaseUrl();
  const root = base.endsWith('/') ? base : `${base}/`;
  return new URL(path.startsWith('/') ? path.slice(1) : path, root);
}

export async function crysolineAnicoreSearch(
  q: string,
  signal?: AbortSignal
): Promise<CrysolineAnicoreSearchRow[]> {
  const url = withBase('api/v1/anime/anicore/search');
  url.searchParams.set('q', q.trim());
  const data = await crysolineGetJson<unknown>(url, 'anicore_search', signal);
  if (!Array.isArray(data)) {
    throw new Error('anicore_search_shape');
  }
  return data as CrysolineAnicoreSearchRow[];
}

export async function crysolineAnicoreInfo(
  id: string,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = withBase(`api/v1/anime/anicore/info/${encodeURIComponent(id.trim())}`);
  return crysolineGetJson<Record<string, unknown>>(url, 'anicore_info', signal);
}

export async function crysolineAnicoreEpisodes(
  seriesId: string,
  signal?: AbortSignal
): Promise<CrysolineAnicoreEpisodeRow[]> {
  const url = withBase(`api/v1/anime/anicore/episodes/${encodeURIComponent(seriesId.trim())}`);
  const data = await crysolineGetJson<unknown>(url, 'anicore_episodes', signal);
  if (!Array.isArray(data)) {
    throw new Error('anicore_episodes_shape');
  }
  return data as CrysolineAnicoreEpisodeRow[];
}

export async function crysolineAnicoreSources(
  seriesId: string,
  episodeId: string,
  opts?: { server?: string; subType?: 'sub' | 'dub'; signal?: AbortSignal }
): Promise<CrysolineAnicoreSourcesPayload> {
  const url = withBase('api/v1/anime/anicore/sources');
  url.searchParams.set('id', seriesId.trim());
  url.searchParams.set('episodeId', episodeId.trim());
  if (opts?.server?.trim()) {
    url.searchParams.set('server', opts.server.trim());
  }
  if (opts?.subType === 'sub' || opts?.subType === 'dub') {
    url.searchParams.set('subType', opts.subType);
  }
  return crysolineGetJson<CrysolineAnicoreSourcesPayload>(
    url,
    'anicore_sources',
    opts?.signal
  );
}
