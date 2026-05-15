import { getCrysolineApiBaseUrl } from '@/server/crysoline/config';
import { crysolineGetJson } from '@/server/crysoline/crysolineFetch';

export interface CrysolineAnilibertyTitle {
  english?: string | null;
  other?: string | null;
}

export interface CrysolineAnilibertySearchRow {
  id: number;
  title?: CrysolineAnilibertyTitle | null;
  totalEpisodes?: number | null;
  year?: number | null;
  metadata?: {
    type?: string | null;
    alias?: string | null;
    isOngoing?: boolean | null;
  } | null;
}

export interface CrysolineAnilibertyEpisodeRow {
  id: string;
  title?: string | null;
  number: number;
  metadata?: {
    hls_480?: string | null;
    hls_720?: string | null;
    hls_1080?: string | null;
    opening?: { start?: number | null; stop?: number | null } | null;
    ending?: { start?: number | null; stop?: number | null } | null;
    duration?: number | null;
  } | null;
}

export interface CrysolineAnilibertySkipBlock {
  start: number | null;
  end: number | null;
}

export interface CrysolineAnilibertySourcesPayload {
  intro?: CrysolineAnilibertySkipBlock | null;
  outro?: CrysolineAnilibertySkipBlock | null;
  sources?: Array<{ url?: string | null; type?: string | null }> | null;
}

function withBase(path: string): URL {
  const base = getCrysolineApiBaseUrl();
  const root = base.endsWith('/') ? base : `${base}/`;
  return new URL(path.startsWith('/') ? path.slice(1) : path, root);
}

export async function crysolineAnilibertySearch(
  q: string,
  signal?: AbortSignal
): Promise<CrysolineAnilibertySearchRow[]> {
  const url = withBase('api/v1/anime/aniliberty/search');
  url.searchParams.set('q', q.trim());
  const data = await crysolineGetJson<unknown>(url, 'aniliberty_search', signal);
  if (!Array.isArray(data)) {
    throw new Error('aniliberty_search_shape');
  }
  return data as CrysolineAnilibertySearchRow[];
}

export async function crysolineAnilibertyEpisodes(
  releaseId: string,
  signal?: AbortSignal
): Promise<CrysolineAnilibertyEpisodeRow[]> {
  const id = encodeURIComponent(releaseId.trim());
  const url = withBase(`api/v1/anime/aniliberty/episodes/${id}`);
  const data = await crysolineGetJson<unknown>(url, 'aniliberty_episodes', signal);
  if (!Array.isArray(data)) {
    throw new Error('aniliberty_episodes_shape');
  }
  return data as CrysolineAnilibertyEpisodeRow[];
}

/**
 * Crysoline: GET …/aniliberty/sources?id={releaseId}&episodeId={episodeUuid}
 * (`episodeId` — рядок UUID з рядка епізоду в `/episodes/{releaseId}`).
 */
export async function crysolineAnilibertySources(
  releaseId: string,
  episodeId: string,
  signal?: AbortSignal
): Promise<CrysolineAnilibertySourcesPayload> {
  const rid = releaseId.trim();
  const eid = episodeId.trim();
  if (!rid || !eid) {
    throw new Error('aniliberty_sources_missing_id');
  }
  const url = withBase('api/v1/anime/aniliberty/sources');
  url.searchParams.set('id', rid);
  url.searchParams.set('episodeId', eid);
  return crysolineGetJson<CrysolineAnilibertySourcesPayload>(
    url,
    'aniliberty_sources',
    signal
  );
}
