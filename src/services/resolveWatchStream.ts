import { readAnilibertyPlaybackQualityHint } from '@/shared/utils/anilibertyPlaybackQualityHint';

const ANILIBERTY_MAPPING_PREFIX = 'aniliberty:mapping:';

function readStoredAnilibertyReleaseId(localAnimeId: string | undefined): string | undefined {
  if (typeof window === 'undefined' || !localAnimeId?.trim()) return undefined;
  try {
    const raw = localStorage.getItem(`${ANILIBERTY_MAPPING_PREFIX}${localAnimeId.trim()}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { libertyId?: string };
    if (parsed && typeof parsed.libertyId === 'string' && parsed.libertyId.trim()) {
      return parsed.libertyId.trim();
    }
  } catch {

  }
  return undefined;
}

export type WatchResolveStreamProvider = 'animepahe' | 'aniliberty' | 'hikka';

export interface WatchResolveParams {
  anilistId?: number;
  malId?: number;
  providerAniId?: string;

  episodeEpToken?: string;

  episodeHasDub?: boolean;
  episode: number;

  expectedEpisodes?: number;
  anilistStillAiring?: boolean;
  lang: 'sub' | 'dub';
  keyword?: string;
  localAnimeId?: string;
  streamProvider?: WatchResolveStreamProvider;

  anilibertyCatalogVerified?: boolean;
}

export interface WatchResolveResponse {
  success: boolean;
  resolved_anime: {
    ani_id: string;
    slug: string;
    status: 'verified' | 'suspect';
    resolved_by: 'cache' | 'direct_anilist' | 'direct_mal' | 'fuzzy_last_resort';
  };
  episode: {
    number: number;
    ep_token: string;
    hasSub: boolean;
    hasDub: boolean;
  };
  stream: {
    url: string;

    format?: 'hls' | 'mp4';
    lang: 'sub' | 'dub';
    server: string;
    request_headers?: Record<string, string>;
    tracks: Array<{ file: string; kind?: string; label?: string; default?: boolean }>;
  };
  fallback: {
    applied: boolean;
    from: 'sub' | 'dub' | null;
    to: 'sub' | 'dub' | null;
    reason: string | null;
  };
  debug: { latency_ms: number };
  stream_provider?: WatchResolveStreamProvider;
  segments?: {
    intro: { start: number; end: number } | null;
    outro: { start: number; end: number } | null;
  };
  quality_variants?: Array<{
    height: number;
    label: string;
    url: string;
    request_headers?: Record<string, string>;
  }>;
}

function normalizeKeyword(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export async function resolveWatchStream(
  params: WatchResolveParams,
  signal?: AbortSignal
): Promise<WatchResolveResponse> {
  const query = new URLSearchParams();
  if (params.anilistId != null) query.set('anilist_id', String(params.anilistId));
  if (params.malId != null) query.set('mal_id', String(params.malId));
  if (params.providerAniId?.trim()) query.set('ani_id', params.providerAniId.trim());
  const epToken = params.episodeEpToken?.trim();
  if (epToken) query.set('ep_token', epToken);
  if (params.episodeHasDub === true) query.set('episode_has_dub', '1');
  if (params.episodeHasDub === false) query.set('episode_has_dub', '0');
  if (params.keyword) {
    const keyword = normalizeKeyword(params.keyword);
    if (keyword) query.set('keyword', keyword);
  }
  if (params.localAnimeId) query.set('local_anime_id', params.localAnimeId);
  query.set('episode', String(params.episode));
  if (params.expectedEpisodes != null && params.expectedEpisodes > 0) {
    query.set('expected_episodes', String(Math.floor(params.expectedEpisodes)));
  }
  if (params.anilistStillAiring === true) {
    query.set('anilist_still_airing', '1');
  }
  query.set('lang', params.lang === 'dub' ? 'dub' : 'sub');
  const sp = params.streamProvider ?? 'animepahe';
  query.set(
    'stream_provider',
    sp === 'aniliberty' ? 'aniliberty' : sp === 'hikka' ? 'hikka' : 'animepahe'
  );

  if (sp === 'animepahe') {
    const libertyId = readStoredAnilibertyReleaseId(params.localAnimeId);
    if (libertyId) query.set('aniliberty_release_id', libertyId);
  }

  if (sp === 'aniliberty') {
    const qualityHint = readAnilibertyPlaybackQualityHint();
    if (qualityHint) query.set('preferred_server_hint', qualityHint);
    if (params.anilibertyCatalogVerified === true) {
      query.set('aniliberty_catalog_verified', '1');
    }
  }

  const res = await fetch(`/api/watch/resolve?${query.toString()}`, {
    method: 'GET',
    cache: 'default',
    signal,
    headers: { accept: 'application/json' },
  });
  const text = await res.text();
  let json: (WatchResolveResponse & { error?: string }) | null = null;
  try {
    json = text.trim()
      ? (JSON.parse(text) as WatchResolveResponse & { error?: string })
      : null;
  } catch {
    throw new Error(`watch_resolve_invalid_json_${res.status}`);
  }
  if (!json) {
    throw new Error(`watch_resolve_empty_${res.status}`);
  }
  if (!res.ok || !json.success) {
    const raw = json.error;
    const message =
      typeof raw === 'string'
        ? raw
        : raw != null
          ? JSON.stringify(raw)
          : `watch_resolve_failed_${res.status}`;
    const reasonRaw = (json as { reason?: unknown }).reason;
    const reason =
      typeof reasonRaw === 'string' && reasonRaw.trim() ? reasonRaw.trim() : '';
    throw new Error(reason ? `${message}|${reason}` : message);
  }
  return json;
}
