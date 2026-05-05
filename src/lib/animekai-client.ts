import { animekaiApi } from '@/lib/animekai-api';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { AnimeKaiSourceResponse } from '@/shared/types/AnimeKaiSourceTypes';

export interface AnimeKaiResolvedMapping {
  ani_id: string;
  slug?: string;
  status?: string;
  confidence?: number;
}

interface ResolvePayload {
  ani_id?: unknown;
  slug?: unknown;
  status?: unknown;
  confidence?: unknown;
  mapping?: unknown;
  result?: unknown;
  data?: unknown;
}

interface MappingResolveRequest {
  local_anime_id?: string;
  anilist_id?: number | string;
  mal_id?: number | string;
  keyword?: string;
}

interface MappingHealthcheckRequest {
  local_anime_id?: string;
  anilist_id?: number | string;
  mal_id?: number | string;
  ani_id?: string;
  reason?: string;
}

function parseResolvedCandidate(input: unknown): AnimeKaiResolvedMapping | null {
  if (!input || typeof input !== "object") return null;
  const payload = input as ResolvePayload;

  const directAni = typeof payload.ani_id === 'string' ? payload.ani_id.trim() : '';
  if (directAni) {
    return {
      ani_id: directAni,
      slug: typeof payload.slug === 'string' ? payload.slug : undefined,
      status: typeof payload.status === 'string' ? payload.status : undefined,
      confidence:
        typeof payload.confidence === 'number' && Number.isFinite(payload.confidence)
          ? payload.confidence
          : undefined,
    };
  }

  return (
    parseResolvedCandidate(payload.mapping) ??
    parseResolvedCandidate(payload.result) ??
    parseResolvedCandidate(payload.data)
  );
}

async function postInternal<TReq extends object>(
  path: string,
  body: TReq,
  signal?: AbortSignal
): Promise<unknown> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Internal proxy failed (${res.status})`);
  }
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Internal proxy returned non-JSON for ${path}`);
  }
}

export const animekaiClient = {
  async resolveByAnilist(
    anilistId: number | string,
    localAnimeId?: string,
    keyword?: string,
    signal?: AbortSignal
  ): Promise<AnimeKaiResolvedMapping | null> {
    const q = new URLSearchParams();
    q.set('anilist_id', String(anilistId).trim());
    if (localAnimeId?.trim()) q.set('local_anime_id', localAnimeId.trim());
    if (keyword?.trim()) q.set('keyword', keyword.trim());
    const raw = await animekaiApi.get<unknown>(`/api/search?${q.toString()}`, undefined, signal);
    return parseResolvedCandidate(raw);
  },

  async resolveByMal(
    malId: number | string,
    localAnimeId?: string,
    keyword?: string,
    signal?: AbortSignal
  ): Promise<AnimeKaiResolvedMapping | null> {
    const q = new URLSearchParams();
    q.set('mal_id', String(malId).trim());
    if (localAnimeId?.trim()) q.set('local_anime_id', localAnimeId.trim());
    if (keyword?.trim()) q.set('keyword', keyword.trim());
    const raw = await animekaiApi.get<unknown>(`/api/search?${q.toString()}`, undefined, signal);
    return parseResolvedCandidate(raw);
  },

  async getEpisodes(aniId: string, signal?: AbortSignal): Promise<unknown> {
    return animekaiApi.get(`/api/episodes/${encodeURIComponent(aniId.trim())}`, undefined, signal);
  },

  async getServers(epToken: string, signal?: AbortSignal): Promise<unknown> {
    return animekaiApi.get(`/api/servers/${encodeURIComponent(epToken.trim())}`, undefined, signal);
  },

  async getSource(linkId: string, signal?: AbortSignal): Promise<AnimeKaiSourceResponse> {
    return animekaiApi.get<AnimeKaiSourceResponse>(
      `/api/source/${encodeURIComponent(linkId.trim())}`,
      undefined,
      signal
    );
  },

  async resolveMapping(body: MappingResolveRequest, signal?: AbortSignal): Promise<unknown> {
    return postInternal('/internal/animekai/mapping/resolve', body, signal);
  },

  async healthcheckMapping(
    body: MappingHealthcheckRequest,
    signal?: AbortSignal
  ): Promise<unknown> {
    try {
      return await postInternal('/internal/animekai/mapping/healthcheck', body, signal);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      /**
       * Healthcheck — best effort. На частині інстансів бекенду mapping/healthcheck
       * може бути вимкнений (404). Не роняємо UX і не засмічуємо консоль unhandled error.
       */
      if (message.includes('404')) return null;
      return null;
    }
  },
};

export function hasDubInServerList(servers: ServerInfo[] | null | undefined): boolean {
  if (!servers?.length) return false;
  return servers.some((s) => s.type.toLowerCase() === 'dub');
}
