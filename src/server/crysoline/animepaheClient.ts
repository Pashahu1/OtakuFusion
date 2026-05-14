import { getCrysolineApiBaseUrl } from '@/server/crysoline/config';
import { crysolineGetJson } from '@/server/crysoline/crysolineFetch';

export interface CrysolineAnimepaheSearchRow {
  id: string;
  title: { romaji?: string; english?: string; native?: string };
  totalEpisodes: number;
  year: number;
  metadata?: { rating?: number; type?: string };
}

export interface CrysolineAnimepaheEpisodeRow {
  id: string;
  title?: string;
  number: number;
  metadata?: { duration?: string; url?: string };
}

export interface CrysolineAnimepaheSourceRow {
  url?: string;
  isM3U8?: boolean;
  quality?: string;
  isDub?: boolean;
  proxy?: string;
}

export interface CrysolineAnimepaheSourcesPayload {
  headers?: Record<string, string>;
  sources?: CrysolineAnimepaheSourceRow[];
}

function withBase(path: string): URL {
  const base = getCrysolineApiBaseUrl();
  const root = base.endsWith('/') ? base : `${base}/`;
  return new URL(path.startsWith('/') ? path.slice(1) : path, root);
}

export async function crysolineAnimepaheSearch(
  q: string,
  signal?: AbortSignal
): Promise<CrysolineAnimepaheSearchRow[]> {
  const url = withBase('api/v1/anime/animepahe/search');
  url.searchParams.set('q', q.trim());
  const data = await crysolineGetJson<unknown>(url, 'animepahe_search', signal);
  if (!Array.isArray(data)) {
    throw new Error('animepahe_search_shape');
  }
  return data as CrysolineAnimepaheSearchRow[];
}

export async function crysolineAnimepaheEpisodes(
  seriesId: string,
  signal?: AbortSignal
): Promise<CrysolineAnimepaheEpisodeRow[]> {
  const id = encodeURIComponent(seriesId.trim());
  const url = withBase(`api/v1/anime/animepahe/episodes/${id}`);
  const data = await crysolineGetJson<unknown>(url, 'animepahe_episodes', signal);
  if (!Array.isArray(data)) {
    throw new Error('animepahe_episodes_shape');
  }
  return data as CrysolineAnimepaheEpisodeRow[];
}

export async function crysolineAnimepaheSources(
  seriesId: string,
  episodeId: string,
  signal?: AbortSignal
): Promise<CrysolineAnimepaheSourcesPayload> {
  const url = withBase('api/v1/anime/animepahe/sources');
  url.searchParams.set('id', seriesId.trim());
  url.searchParams.set('episodeId', episodeId.trim());
  return crysolineGetJson<CrysolineAnimepaheSourcesPayload>(
    url,
    'animepahe_sources',
    signal
  );
}
