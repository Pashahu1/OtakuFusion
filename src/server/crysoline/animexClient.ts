import { getCrysolineApiBaseUrl } from '@/server/crysoline/config';
import { crysolineGetJson } from '@/server/crysoline/crysolineFetch';
import {
  crysolineAnicoreEpisodes,
  crysolineAnicoreSources,
  type CrysolineAnicoreEpisodeRow,
  type CrysolineAnicoreSearchRow,
  type CrysolineAnicoreSourcesPayload,
} from '@/server/crysoline/anicoreClient';

export type CrysolineAnimexSearchRow = CrysolineAnicoreSearchRow;
export type CrysolineAnimexEpisodeRow = CrysolineAnicoreEpisodeRow;
export type CrysolineAnimexSourcesPayload = CrysolineAnicoreSourcesPayload;

export type AnimexSubType = 'hard-sub' | 'soft-sub' | 'dub' | 'sub';

function animexAnicoreEpisodesFallbackEnabled(): boolean {
  const raw = process.env.ANIMEX_ANICORE_EPISODES_FALLBACK?.trim();
  if (raw === '0' || raw === 'false') return false;
  return true;
}

function animexSubTypeToAnicore(subType?: AnimexSubType): 'sub' | 'dub' | undefined {
  if (subType === 'dub') return 'dub';
  if (subType === 'hard-sub' || subType === 'soft-sub' || subType === 'sub') return 'sub';
  return undefined;
}

function withBase(path: string): URL {
  const base = getCrysolineApiBaseUrl();
  const root = base.endsWith('/') ? base : `${base}/`;
  return new URL(path.startsWith('/') ? path.slice(1) : path, root);
}

export async function crysolineAnimexSearch(
  q: string,
  signal?: AbortSignal
): Promise<CrysolineAnimexSearchRow[]> {
  const url = withBase('api/v1/anime/animex/search');
  url.searchParams.set('q', q.trim());
  const data = await crysolineGetJson<unknown>(url, 'animex_search', signal);
  if (!Array.isArray(data)) {
    throw new Error('animex_search_shape');
  }
  return data as CrysolineAnimexSearchRow[];
}

export async function crysolineAnimexInfo(
  id: string,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = withBase(`api/v1/anime/animex/info/${encodeURIComponent(id.trim())}`);
  return crysolineGetJson<Record<string, unknown>>(url, 'animex_info', signal);
}

export async function crysolineAnimexEpisodes(
  seriesId: string,
  signal?: AbortSignal
): Promise<CrysolineAnimexEpisodeRow[]> {
  const id = seriesId.trim();
  if (!id) return [];

  try {
    const url = withBase(`api/v1/anime/animex/episodes/${encodeURIComponent(id)}`);
    const data = await crysolineGetJson<unknown>(url, 'animex_episodes', signal);
    if (!Array.isArray(data)) {
      throw new Error('animex_episodes_shape');
    }
    return data as CrysolineAnimexEpisodeRow[];
  } catch (err) {
    if (!animexAnicoreEpisodesFallbackEnabled()) throw err;
    return crysolineAnicoreEpisodes(id, signal);
  }
}

export async function crysolineAnimexSources(
  seriesId: string,
  episodeId: string,
  opts?: { server?: string; subType?: AnimexSubType; signal?: AbortSignal }
): Promise<CrysolineAnimexSourcesPayload> {
  const sid = seriesId.trim();
  const eid = episodeId.trim();
  if (!sid || !eid) {
    return { headers: {}, sources: [] };
  }

  try {
    const url = withBase('api/v1/anime/animex/sources');
    url.searchParams.set('id', sid);
    url.searchParams.set('episodeId', eid);
    if (opts?.server?.trim()) {
      url.searchParams.set('server', opts.server.trim());
    }
    if (opts?.subType) {
      url.searchParams.set('subType', opts.subType);
    }
    return await crysolineGetJson<CrysolineAnimexSourcesPayload>(
      url,
      'animex_sources',
      opts?.signal
    );
  } catch (err) {
    if (!animexAnicoreEpisodesFallbackEnabled()) throw err;
    return crysolineAnicoreSources(sid, eid, {
      server: opts?.server,
      subType: animexSubTypeToAnicore(opts?.subType),
      signal: opts?.signal,
    });
  }
}

export function watchLangToAnimexSubTypes(lang: 'sub' | 'dub'): AnimexSubType[] {
  if (lang === 'dub') return ['dub'];
  return ['hard-sub', 'soft-sub', 'sub'];
}
