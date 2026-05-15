import { unstable_cache } from 'next/cache';
import { getAnimePaheEpisodesCached } from '@/server/animepahe/episodesCached';
import { getAnimePaheSourcesCached } from '@/server/animepahe/sourcesCached';
import { getAnilibertyEpisodesCached } from '@/server/aniliberty/episodesCached';
import { getAnilibertySourcesCached } from '@/server/aniliberty/sourcesCached';
import type {
  CrysolineAnimepaheSourceRow,
  CrysolineAnimepaheSourcesPayload,
} from '@/server/crysoline/animepaheClient';
import type { CrysolineAnilibertySourcesPayload } from '@/server/crysoline/anilibertyClient';
import { mapCrysolineAnilibertyEpisodes } from '@/services/aniliberty/mapAnilibertyEpisodes';
import {
  buildProbeHeaders,
  isPlayableViaProxy,
  readWatchProbeConfig,
  type WatchProbeConfig,
} from '@/lib/watchResolveProbe';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { StreamingType } from '@/shared/types/StreamingTypes';

type WatchLang = 'sub' | 'dub';

type WatchResolveStreamProvider = 'animepahe' | 'aniliberty';

const inflightResolve = new Map<string, Promise<Response>>();

function canonicalResolveKey(reqUrl: URL): string {
  const entries = [...reqUrl.searchParams.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const sp = new URLSearchParams(entries);
  return `${reqUrl.pathname}?${sp.toString()}`;
}

interface WatchResolveOutcome {
  status: number;
  body: Record<string, unknown>;
}

function outcomeToResponse(out: WatchResolveOutcome): Response {
  const headers: Record<string, string> =
    out.status === 200
      ? { 'Cache-Control': 'private, max-age=12, stale-while-revalidate=24' }
      : { 'Cache-Control': 'no-store' };
  return Response.json(out.body, { status: out.status, headers });
}

function isWatchResolveDataCacheEnabled(): boolean {
  if (process.env.WATCH_RESOLVE_CACHE === '0') return false;
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.WATCH_RESOLVE_CACHE !== '1'
  ) {
    return false;
  }
  return true;
}

function watchResolveCacheRevalidateSec(): number {
  const n = Number(process.env.WATCH_RESOLVE_CACHE_SECONDS);
  if (Number.isFinite(n) && n >= 5 && n <= 300) return Math.floor(n);
  return 30;
}

class WatchResolveNonOkError extends Error {
  constructor(public readonly outcome: WatchResolveOutcome) {
    super('watch_resolve_non_ok');
    this.name = 'WatchResolveNonOkError';
  }
}

function extractWatchResolveNonOkOutcome(err: unknown): WatchResolveOutcome | null {
  if (err instanceof WatchResolveNonOkError) {
    return err.outcome;
  }
  if (typeof err !== 'object' || err === null) return null;
  const rec = err as Record<string, unknown>;
  const outcome = rec.outcome;
  if (!outcome || typeof outcome !== 'object' || Array.isArray(outcome)) return null;
  const o = outcome as Record<string, unknown>;
  const status = o.status;
  const body = o.body;
  if (
    typeof status === 'number' &&
    body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body)
  ) {
    return { status, body: body as Record<string, unknown> };
  }
  return null;
}

function getNormalizedLang(sp: URLSearchParams): WatchLang {
  const raw = sp.get('lang') ?? sp.get('language');
  return raw?.trim().toLowerCase() === 'dub' ? 'dub' : 'sub';
}

function getStreamProvider(sp: URLSearchParams): WatchResolveStreamProvider {
  const raw = (sp.get('stream_provider') ?? '').trim().toLowerCase();
  if (raw === 'aniliberty' || raw === 'anilibria') return 'aniliberty';
  return 'animepahe';
}

function parseEpisodeNumber(sp: URLSearchParams): number | null {
  const value = Number(sp.get('episode') ?? '');
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}

function pickEpisodeByNumber(episodes: EpisodesTypes[], episodeNo: number): EpisodesTypes | null {
  const exact = episodes.find((ep) => ep.episode_no === episodeNo);
  if (exact) return exact;
  return episodes.find((ep) => ep.data_id === episodeNo) ?? null;
}

function mergeRootHeaders(
  root: Record<string, string> | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!root) return out;
  for (const [k, v] of Object.entries(root)) {
    if (typeof k !== 'string' || !k.trim()) continue;
    if (typeof v !== 'string' || !v.trim()) continue;
    out[k.trim()] = v.trim();
  }
  return out;
}

function resolutionRank(quality: string | undefined): number {
  const q = (quality ?? '').toLowerCase();
  const m = q.match(/(\d{3,4})p/);
  return m ? parseInt(m[1], 10) : 0;
}

function buildAnimePaheStreamCandidates(
  payload: CrysolineAnimepaheSourcesPayload,
  requestedLang: WatchLang
): StreamingType[] {
  const rootHeaders = mergeRootHeaders(payload.headers);
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const filtered = sources.filter((s: CrysolineAnimepaheSourceRow) => {
    const isDub = s.isDub === true;
    if (requestedLang === 'dub') return isDub;
    return !isDub;
  });
  const list = filtered.length ? filtered : sources;
  const sorted = [...list].sort(
    (a, b) => resolutionRank(b.quality) - resolutionRank(a.quality)
  );
  const out: StreamingType[] = [];
  let nid = 0;
  for (const row of sorted) {
    const headers = { ...rootHeaders };
    const fileUrls = [row.proxy, row.url].filter(
      (u): u is string => typeof u === 'string' && u.trim().length > 0
    );
    const uniq = [...new Set(fileUrls.map((u) => u.trim()))];
    for (const file of uniq) {
      nid += 1;
      out.push({
        id: nid,
        type: row.isDub === true ? ('dub' as const) : ('sub' as const),
        link: { file, type: 'hls' },
        tracks: [],
        server: row.quality?.trim() || 'Animepahe',
        request_headers: Object.keys(headers).length ? headers : undefined,
      });
    }
  }
  return out;
}

const ANILIBRIA_STREAM_HEADERS: Record<string, string> = {
  Referer: 'https://www.anilibria.tv/',
  Origin: 'https://www.anilibria.tv',
};

function inferAnilibertyResolutionLabel(urlStr: string): string {
  const m = urlStr.match(/\/(480|720|1080)\//);
  if (m) return `${m[1]}p`;
  return 'Auto';
}

function normalizeSkipSegmentBlock(
  block: { start?: number | null; end?: number | null } | null | undefined
): { start: number; end: number } | null {
  if (!block) return null;
  const s = block.start;
  const e = block.end;
  if (typeof s !== 'number' || typeof e !== 'number' || !Number.isFinite(s) || !Number.isFinite(e)) {
    return null;
  }
  return { start: s, end: e };
}

function buildAnilibertyStreamCandidates(payload: CrysolineAnilibertySourcesPayload): StreamingType[] {
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const rows = sources.filter(
    (s) =>
      (s.type ?? '').trim().toLowerCase() === 'hls' &&
      typeof s.url === 'string' &&
      s.url.trim().length > 0
  );
  const scored = rows.map((s) => {
    const file = s.url!.trim();
    const label = inferAnilibertyResolutionLabel(file);
    const rank = resolutionRank(label);
    return { file, label, rank };
  });
  const sorted = [...scored].sort((a, b) => b.rank - a.rank);
  const out: StreamingType[] = [];
  let nid = 0;
  for (const row of sorted) {
    nid += 1;
    out.push({
      id: nid,
      type: 'sub',
      link: { file: row.file, type: 'hls' },
      tracks: [],
      server: `${row.label} · Anilibria`,
      request_headers: { ...ANILIBRIA_STREAM_HEADERS },
    });
  }
  return out;
}

function prioritizeByServerHint(
  candidates: StreamingType[],
  hint: string | null | undefined
): StreamingType[] {
  const raw = hint?.trim();
  if (!raw) return candidates;
  const h = raw.toLowerCase();
  const match = candidates.filter((c) => c.server.toLowerCase().includes(h));
  const rest = candidates.filter((c) => !c.server.toLowerCase().includes(h));
  return [...match, ...rest];
}

async function tryResolveStreamingCandidate(
  stream: StreamingType,
  origin: string,
  probeCfg: WatchProbeConfig
): Promise<StreamingType> {
  const ok = await isPlayableViaProxy(origin, stream, probeCfg);
  if (!ok) throw new Error('not_playable');
  return stream;
}

async function resolveFirstWorkingAnimePaheCandidate(
  candidates: StreamingType[],
  origin: string,
  probeCfg: WatchProbeConfig
): Promise<StreamingType> {
  let lastErr: unknown = null;
  for (const c of candidates) {
    try {
      return await tryResolveStreamingCandidate(c, origin, probeCfg);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('no_working_source');
}

async function computeAnimepaheWatchResolveOutcome(params: {
  startedAt: number;
  episode: number;
  lang: WatchLang;
  probeCfg: WatchProbeConfig;
  origin: string;
  seriesId: string;
  preferredHint: string | null;
  anilibertyReleaseId: string | null;
}): Promise<WatchResolveOutcome> {
  const {
    startedAt,
    episode,
    lang,
    probeCfg,
    origin,
    seriesId,
    preferredHint,
    anilibertyReleaseId,
  } = params;

  try {
    const episodesResult = await getAnimePaheEpisodesCached(seriesId);
    const targetEpisode = pickEpisodeByNumber(episodesResult.episodes, episode);
    const epHash = targetEpisode?.ep_token?.trim();
    if (!epHash) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'episode_not_found',
          reason: `Episode ${episode} is missing in Animepahe catalog`,
        },
      };
    }

    const sourcesPayload = await getAnimePaheSourcesCached(seriesId, epHash);
    let candidates = buildAnimePaheStreamCandidates(sourcesPayload, lang);
    if (!candidates.length) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: 'animepahe_sources_empty',
        },
      };
    }

    candidates = prioritizeByServerHint(candidates, preferredHint);

    const primary = await resolveFirstWorkingAnimePaheCandidate(
      candidates,
      origin,
      probeCfg
    );

    const usedLang: WatchLang = primary.type === 'dub' ? 'dub' : 'sub';
    const fallbackApplied = lang !== usedLang;

    const body: Record<string, unknown> = {
      success: true,
      stream_provider: 'animepahe',
      resolved_anime: {
        ani_id: seriesId,
        slug: seriesId,
        status: 'verified',
        resolved_by: 'cache',
      },
      episode: {
        number: episode,
        ep_token: epHash,
        hasSub: Boolean(targetEpisode?.hasSub ?? true),
        hasDub: Boolean(targetEpisode?.hasDub ?? false),
      },
      stream: {
        url: primary.link.file,
        lang: usedLang,
        server: primary.server,
        request_headers: buildProbeHeaders(primary),
        tracks: primary.tracks ?? [],
      },
      fallback: {
        applied: fallbackApplied,
        from: fallbackApplied ? lang : null,
        to: fallbackApplied ? usedLang : null,
        reason: fallbackApplied ? `${lang}_unavailable_or_failed` : null,
      },
      debug: {
        latency_ms: Date.now() - startedAt,
        requested_lang: lang,
      },
    };

    const libertyId = anilibertyReleaseId?.trim() ?? null;
    if (libertyId) {
      try {
        const rows = await getAnilibertyEpisodesCached(libertyId);
        const { episodes: libertyEpisodes } = mapCrysolineAnilibertyEpisodes(rows);
        const libertyTarget = pickEpisodeByNumber(libertyEpisodes, episode);
        const libertyEpToken = libertyTarget?.ep_token?.trim();
        if (libertyEpToken) {
          const segPayload = await getAnilibertySourcesCached(libertyId, libertyEpToken);
          const intro = normalizeSkipSegmentBlock(segPayload.intro);
          const outro = normalizeSkipSegmentBlock(segPayload.outro);
          if (intro || outro) {
            body.segments = { intro, outro };
          }
        }
      } catch {
        /* Anilibria — лише підказка для маркерів OP/ED; не ламаємо Animepahe-резолв. */
      }
    }

    return { status: 200, body };
  } catch (error) {
    return {
      status: 502,
      body: {
        success: false,
        error: error instanceof Error ? error.message : 'watch_resolve_failed',
      },
    };
  }
}

async function computeAnilibertyWatchResolveOutcome(params: {
  startedAt: number;
  episode: number;
  origin: string;
  seriesId: string;
  preferredHint: string | null;
}): Promise<WatchResolveOutcome> {
  const { startedAt, episode, origin, seriesId, preferredHint } = params;
  const probeCfg = readWatchProbeConfig('sub');

  try {
    const rows = await getAnilibertyEpisodesCached(seriesId);
    const { episodes } = mapCrysolineAnilibertyEpisodes(rows);
    const targetEpisode = pickEpisodeByNumber(episodes, episode);
    const epToken = targetEpisode?.ep_token?.trim();
    if (!epToken) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'episode_not_found',
          reason: `Episode ${episode} is missing in Aniliberty catalog`,
        },
      };
    }

    const sourcesPayload = await getAnilibertySourcesCached(seriesId, epToken);
    let candidates = buildAnilibertyStreamCandidates(sourcesPayload);
    if (!candidates.length) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: 'aniliberty_sources_empty',
        },
      };
    }

    candidates = prioritizeByServerHint(candidates, preferredHint);

    const primary = await resolveFirstWorkingAnimePaheCandidate(
      candidates,
      origin,
      probeCfg
    );

    const intro = normalizeSkipSegmentBlock(sourcesPayload.intro);
    const outro = normalizeSkipSegmentBlock(sourcesPayload.outro);

    const body: Record<string, unknown> = {
      success: true,
      stream_provider: 'aniliberty',
      resolved_anime: {
        ani_id: seriesId,
        slug: seriesId,
        status: 'verified',
        resolved_by: 'cache',
      },
      episode: {
        number: episode,
        ep_token: epToken,
        hasSub: true,
        hasDub: false,
      },
      stream: {
        url: primary.link.file,
        lang: 'sub',
        server: primary.server,
        request_headers: buildProbeHeaders(primary),
        tracks: primary.tracks ?? [],
      },
      segments: {
        intro,
        outro,
      },
      fallback: {
        applied: false,
        from: null,
        to: null,
        reason: null,
      },
      debug: {
        latency_ms: Date.now() - startedAt,
        requested_lang: 'sub',
      },
    };

    return { status: 200, body };
  } catch (error) {
    return {
      status: 502,
      body: {
        success: false,
        error: error instanceof Error ? error.message : 'watch_resolve_failed',
      },
    };
  }
}

async function computeWatchResolveOutcome(
  req: Request,
  options?: { publicOrigin: string }
): Promise<WatchResolveOutcome> {
  const startedAt = Date.now();
  const url = new URL(req.url);
  const lang = getNormalizedLang(url.searchParams);
  const episode = parseEpisodeNumber(url.searchParams);

  if (episode == null) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'episode is required and must be a positive integer',
      },
    };
  }

  const probeCfg = readWatchProbeConfig(lang);
  const origin = options?.publicOrigin ?? url.origin;

  const seriesId = url.searchParams.get('ani_id')?.trim();
  const provider = getStreamProvider(url.searchParams);
  const preferredHint = url.searchParams.get('preferred_server_hint')?.trim() ?? null;
  const anilibertyReleaseId =
    url.searchParams.get('aniliberty_release_id')?.trim() ?? null;

  if (!seriesId) {
    return {
      status: 400,
      body: {
        success: false,
        error:
          provider === 'aniliberty'
            ? 'ani_id is required (Aniliberty release id from catalog)'
            : 'ani_id is required (Animepahe series id from catalog)',
      },
    };
  }

  if (provider === 'aniliberty') {
    return computeAnilibertyWatchResolveOutcome({
      startedAt,
      episode,
      origin,
      seriesId,
      preferredHint,
    });
  }

  return computeAnimepaheWatchResolveOutcome({
    startedAt,
    episode,
    lang,
    probeCfg,
    origin,
    seriesId,
    preferredHint,
    anilibertyReleaseId,
  });
}

async function handleWatchResolve(req: Request): Promise<Response> {
  if (!isWatchResolveDataCacheEnabled()) {
    return outcomeToResponse(await computeWatchResolveOutcome(req));
  }

  const url = new URL(req.url);
  const cacheKey = canonicalResolveKey(url);
  const publicOrigin = url.origin;

  try {
    const fetchCached = unstable_cache(
      async () => {
        const replayHref = new URL(cacheKey, 'https://watch-resolve.replay');
        const syntheticReq = new Request(replayHref);
        const o = await computeWatchResolveOutcome(syntheticReq, {
          publicOrigin,
        });
        if (o.status !== 200) throw new WatchResolveNonOkError(o);
        return o.body;
      },
      ['watch-resolve-data-v4', cacheKey, publicOrigin],
      { revalidate: watchResolveCacheRevalidateSec() }
    );

    const body = await fetchCached();
    const prevDebug = body.debug;
    const nextBody: Record<string, unknown> =
      typeof prevDebug === 'object' && prevDebug !== null && !Array.isArray(prevDebug)
        ? {
            ...body,
            debug: {
              ...(prevDebug as Record<string, unknown>),
              latency_ms: 0,
              cache_hit: true,
            },
          }
        : { ...body, debug: { latency_ms: 0, cache_hit: true } };
    return outcomeToResponse({ status: 200, body: nextBody });
  } catch (err) {
    const nonOk = extractWatchResolveNonOkOutcome(err);
    if (nonOk) {
      return outcomeToResponse(nonOk);
    }
    console.error('[watch/resolve] unstable_cache path failed, uncached fallback', err);
    return outcomeToResponse(await computeWatchResolveOutcome(req));
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const episode = parseEpisodeNumber(url.searchParams);

    if (episode == null) {
      return Response.json(
        {
          success: false,
          error: 'episode is required and must be a positive integer',
        },
        { status: 400 }
      );
    }

    const key = canonicalResolveKey(url);
    let pending = inflightResolve.get(key);
    if (!pending) {
      pending = handleWatchResolve(req).finally(() => inflightResolve.delete(key));
      inflightResolve.set(key, pending);
    }
    return await pending;
  } catch (err) {
    console.error('[watch/resolve] GET fatal', err);
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'watch_resolve_fatal',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
