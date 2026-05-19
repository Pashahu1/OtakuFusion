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
import { isAnilibertyEpisodeCountAcceptable } from '@/services/aniliberty/anilibertyEpisodeMatch';
import {
  buildProbeHeaders,
  isPlayableViaProxy,
  readWatchProbeConfig,
  type WatchProbeConfig,
} from '@/lib/watchResolveProbe';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { StreamingType } from '@/shared/types/StreamingTypes';
import { inferAnimepaheSourceIsDub } from '@/services/animepahe/inferAnimepaheSourceIsDub';
import { tryResolveMirunoDubHls } from '@/server/miruno/fetchMirunoDubStream';
import { decodeHikkaEpToken } from '@/services/hikka/hikkaEpToken';
import { fetchHikkaWatchV2 } from '@/services/hikka/hikkaFeaturesClient';
import {
  mapHikkaTeamEpisodes,
  pickDefaultHikkaCatalog,
} from '@/services/hikka/mapHikkaCatalog';
import { refererForHikkaPageUrl } from '@/services/hikka/extractPageM3u8';
import { extractHikkaM3u8Cached } from '@/server/hikka/extractM3u8Cached';
import { HikkaFeaturesForbiddenError } from '@/services/hikka/hikkaOutboundFetch';

type WatchLang = 'sub' | 'dub';

type WatchResolveStreamProvider = 'animepahe' | 'aniliberty' | 'hikka';

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
  if (raw === 'hikka' || raw === 'ukrainian' || raw === 'uk') return 'hikka';
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

function urlLooksLikeCrysolineProxy(file: string): boolean {
  const u = file.toLowerCase();
  return u.includes('proxy.crysoline') || u.includes('crysoline.moe/proxy');
}

/** Одна роздільність — один кандидат; пріоритет проксі Crysoline над прямим CDN. */
function dedupeStreamingCandidatesByHeight(candidates: StreamingType[]): StreamingType[] {
  const map = new Map<number, StreamingType>();
  for (const c of candidates) {
    const h = resolutionRank(c.server);
    if (!Number.isFinite(h) || h <= 0) continue;
    const prev = map.get(h);
    if (!prev) {
      map.set(h, c);
      continue;
    }
    const prevProxy = urlLooksLikeCrysolineProxy(prev.link.file);
    const curProxy = urlLooksLikeCrysolineProxy(c.link.file);
    if (curProxy && !prevProxy) map.set(h, c);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, v]) => v);
}

function qualityVariantsFromCandidates(
  candidates: StreamingType[]
): Array<{
  height: number;
  label: string;
  url: string;
  request_headers: Record<string, string>;
}> {
  const rows = dedupeStreamingCandidatesByHeight(candidates);
  const out: Array<{
    height: number;
    label: string;
    url: string;
    request_headers: Record<string, string>;
  }> = [];
  for (const c of rows) {
    const h = resolutionRank(c.server);
    if (!Number.isFinite(h) || h <= 0) continue;
    out.push({
      height: h,
      label: (c.server ?? '').trim() || `${h}p`,
      url: c.link.file.trim(),
      request_headers: buildProbeHeaders(c),
    });
  }
  return out;
}

function buildAnimePaheStreamCandidates(
  payload: CrysolineAnimepaheSourcesPayload,
  requestedLang: WatchLang
): StreamingType[] {
  const rootHeaders = mergeRootHeaders(payload.headers);
  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const filtered = sources.filter((s: CrysolineAnimepaheSourceRow) => {
    const isDub = inferAnimepaheSourceIsDub(s);
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
        type: inferAnimepaheSourceIsDub(row) ? ('dub' as const) : ('sub' as const),
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

function readMaxProbeCandidates(lang: WatchLang): number {
  const raw = Number(process.env.WATCH_RESOLVE_MAX_PROBE_CANDIDATES);
  if (Number.isFinite(raw) && raw >= 1 && raw <= 8) return Math.floor(raw);
  return lang === 'dub' ? 3 : 4;
}

/** Один URL на роздільність (проксі Crysoline в пріоритеті) — менше послідовних probe. */
function shrinkCandidatesForProbe(
  candidates: StreamingType[],
  lang: WatchLang
): StreamingType[] {
  const deduped = dedupeStreamingCandidatesByHeight(candidates);
  return deduped.slice(0, readMaxProbeCandidates(lang));
}

/** Перший успішний probe паралельно (замість до N×masterMs послідовно). */
async function resolveFirstWorkingAnimePaheCandidate(
  candidates: StreamingType[],
  origin: string,
  probeCfg: WatchProbeConfig,
  lang: WatchLang
): Promise<StreamingType> {
  const toTry = shrinkCandidatesForProbe(candidates, lang);
  if (!toTry.length) throw new Error('no_working_source');

  return new Promise<StreamingType>((resolve, reject) => {
    let failed = 0;
    let lastErr: unknown = null;
    const n = toTry.length;

    for (const c of toTry) {
      void tryResolveStreamingCandidate(c, origin, probeCfg)
        .then(resolve)
        .catch((e) => {
          lastErr = e;
          failed += 1;
          if (failed >= n) {
            reject(lastErr ?? new Error('no_working_source'));
          }
        });
    }
  });
}

function shouldFetchAnilibriaSegmentHints(): boolean {
  const v = process.env.WATCH_RESOLVE_FETCH_SEGMENT_HINTS?.trim().toLowerCase();
  return v === '1' || v === 'true';
}

async function attachAnilibriaSegmentHints(
  body: Record<string, unknown>,
  libertyId: string,
  episode: number
): Promise<void> {
  if (!shouldFetchAnilibriaSegmentHints()) return;
  try {
    const rows = await getAnilibertyEpisodesCached(libertyId);
    const { episodes: libertyEpisodes } = mapCrysolineAnilibertyEpisodes(rows);
    const libertyTarget = pickEpisodeByNumber(libertyEpisodes, episode);
    const libertyEpToken = libertyTarget?.ep_token?.trim();
    if (!libertyEpToken) return;
    const segPayload = await getAnilibertySourcesCached(libertyId, libertyEpToken);
    const intro = normalizeSkipSegmentBlock(segPayload.intro);
    const outro = normalizeSkipSegmentBlock(segPayload.outro);
    if (intro || outro) {
      body.segments = { intro, outro };
    }
  } catch {
    /* Anilibria — лише підказка OP/ED; не блокуємо старт відтворення. */
  }
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
  anilistId: number | null;
  epTokenOverride?: string | null;
  episodeHasDub?: boolean | null;
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
    anilistId,
    epTokenOverride,
    episodeHasDub,
  } = params;

  try {
    let epHash = epTokenOverride?.trim() ?? '';
    let targetEpisode: EpisodesTypes | null = null;

    if (!epHash || episodeHasDub == null) {
      const episodesResult = await getAnimePaheEpisodesCached(seriesId);
      targetEpisode = pickEpisodeByNumber(episodesResult.episodes, episode);
      if (!epHash) epHash = targetEpisode?.ep_token?.trim() ?? '';
    } else {
      targetEpisode = {
        episode_no: episode,
        id: String(episode),
        data_id: episode,
        jname: '',
        title: '',
        japanese_title: '',
        ep_token: epHash,
        hasSub: true,
        hasDub: episodeHasDub === true,
      };
    }

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

    const tryMirunoGapDub =
      lang === 'dub' &&
      targetEpisode != null &&
      targetEpisode.hasDub !== true &&
      anilistId != null;

    const sourcesPayload = await getAnimePaheSourcesCached(seriesId, epHash);
    let candidates = buildAnimePaheStreamCandidates(sourcesPayload, lang);
    candidates = prioritizeByServerHint(candidates, preferredHint);

    let primary: StreamingType | null = null;

    if (candidates.length > 0) {
      try {
        primary = await resolveFirstWorkingAnimePaheCandidate(
          candidates,
          origin,
          probeCfg,
          lang
        );
      } catch {
        primary = null;
      }
    }

    if (!primary && tryMirunoGapDub) {
      primary = await tryResolveMirunoDubHls({
        anilistId: anilistId as number,
        episode,
        origin,
        probeCfg,
      });
    }

    if (!primary) {
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
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: `${lang}_not_available`,
        },
      };
    }

    const fromMiruno = primary.server?.toLowerCase().includes('miruno') ?? false;
    const usedLang: WatchLang = primary.type === 'dub' ? 'dub' : 'sub';
    const fallbackApplied = !fromMiruno && lang !== usedLang;

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
        hasDub: fromMiruno ? false : Boolean(targetEpisode?.hasDub ?? false),
      },
      stream: {
        url: primary.link.file,
        lang: fromMiruno ? 'dub' : usedLang,
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
        ...(fromMiruno ? { miruno_dub_gap_fill: true } : {}),
      },
    };

    const qualityVariants = qualityVariantsFromCandidates(candidates);
    if (qualityVariants.length > 1) {
      body.quality_variants = qualityVariants;
    }

    const libertyId = anilibertyReleaseId?.trim() ?? null;
    if (libertyId) {
      await attachAnilibriaSegmentHints(body, libertyId, episode);
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

async function computeHikkaWatchResolveOutcome(params: {
  startedAt: number;
  episode: number;
  origin: string;
  hikkaSlug: string;
  epTokenOverride?: string | null;
}): Promise<WatchResolveOutcome> {
  const { startedAt, episode, origin, hikkaSlug, epTokenOverride } = params;
  const probeCfg = readWatchProbeConfig('sub');

  try {
    let epToken = epTokenOverride?.trim() ?? '';
    let pageUrl: string | null = null;

    const decoded = epToken ? decodeHikkaEpToken(epToken) : null;
    if (decoded) {
      pageUrl = decoded.pageUrl;
    } else if (!epToken) {
      const watch = await fetchHikkaWatchV2(hikkaSlug);
      if (!watch) {
        return {
          status: 404,
          body: { success: false, error: 'hikka_watch_not_found' },
        };
      }
      const pick = pickDefaultHikkaCatalog(watch);
      if (!pick) {
        return {
          status: 404,
          body: { success: false, error: 'hikka_teams_empty' },
        };
      }
      const episodes = mapHikkaTeamEpisodes(watch, pick, 'Anime');
      const target = pickEpisodeByNumber(episodes, episode);
      epToken = target?.ep_token?.trim() ?? '';
      const again = epToken ? decodeHikkaEpToken(epToken) : null;
      pageUrl = again?.pageUrl ?? null;
    }

    if (!pageUrl) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'episode_not_found',
          reason: `Episode ${episode} is missing in Hikka catalog`,
        },
      };
    }

    const m3u8 = await extractHikkaM3u8Cached(pageUrl);
    if (!m3u8) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: 'hikka_m3u8_not_found',
        },
      };
    }

    const referer = refererForHikkaPageUrl(pageUrl);
    let originHeader = 'https://ashdi.vip';
    try {
      originHeader = new URL(referer).origin;
    } catch {
      /* noop */
    }
    const requestHeaders: Record<string, string> = {
      Referer: referer,
      Origin: originHeader,
    };

    const candidate: StreamingType = {
      id: 1,
      type: 'sub',
      link: { file: m3u8, type: 'hls' },
      tracks: [],
      server: decoded?.team?.trim() || 'Ukrainian',
      request_headers: requestHeaders,
      iframe: pageUrl,
    };

    let playable = await isPlayableViaProxy(origin, candidate, probeCfg);
    // moonanime: підписаний CDN часто не проходить server-side probe, у плеєрі з Referer — ок
    if (!playable && decoded?.source === 'moon') {
      playable = true;
    }
    if (!playable) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'no_working_source',
          reason: 'hikka_stream_probe_failed',
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        stream_provider: 'hikka',
        resolved_anime: {
          ani_id: hikkaSlug,
          slug: hikkaSlug,
          status: 'verified',
          resolved_by: 'cache',
        },
        episode: {
          number: episode,
          ep_token: epToken,
          hasSub: false,
          hasDub: true,
        },
        stream: {
          url: m3u8,
          lang: 'sub',
          server: candidate.server ?? 'Ukrainian',
          request_headers: requestHeaders,
          tracks: [],
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
          hikka_source: decoded?.source ?? null,
        },
      },
    };
  } catch (error) {
    if (error instanceof HikkaFeaturesForbiddenError) {
      return {
        status: 403,
        body: {
          success: false,
          error: 'hikka_features_forbidden',
          reason: 'Hikka Features API blocked this host. Configure HIKKA_FEATURES_RELAY_BASE on Vercel.',
        },
      };
    }
    return {
      status: 502,
      body: {
        success: false,
        error: error instanceof Error ? error.message : 'watch_resolve_failed',
      },
    };
  }
}

function parseExpectedEpisodesParam(sp: URLSearchParams): number | null {
  const raw = sp.get('expected_episodes')?.trim();
  if (!raw || !/^\d+$/.test(raw)) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function computeAnilibertyWatchResolveOutcome(params: {
  startedAt: number;
  episode: number;
  origin: string;
  seriesId: string;
  preferredHint: string | null;
  epTokenOverride?: string | null;
  expectedEpisodes?: number | null;
  anilistStillAiring?: boolean;
}): Promise<WatchResolveOutcome> {
  const {
    startedAt,
    episode,
    origin,
    seriesId,
    preferredHint,
    epTokenOverride,
    expectedEpisodes,
    anilistStillAiring = false,
  } = params;
  const probeCfg = readWatchProbeConfig('sub');

  try {
    const rows = await getAnilibertyEpisodesCached(seriesId);
    const { episodes, totalEpisodes } = mapCrysolineAnilibertyEpisodes(rows);

    if (
      expectedEpisodes != null &&
      !isAnilibertyEpisodeCountAcceptable(expectedEpisodes, totalEpisodes, {
        allowPartialCatalog: anilistStillAiring,
        isOngoing: anilistStillAiring,
      })
    ) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'aniliberty_episode_count_mismatch',
          reason: `Anilibria has ${totalEpisodes} episodes, expected about ${expectedEpisodes}`,
        },
      };
    }

    const targetEpisode = pickEpisodeByNumber(episodes, episode);

    let epToken = epTokenOverride?.trim() ?? '';
    if (epToken && targetEpisode?.ep_token?.trim() && epToken !== targetEpisode.ep_token.trim()) {
      epToken = targetEpisode.ep_token.trim();
    }
    if (!epToken) {
      epToken = targetEpisode?.ep_token?.trim() ?? '';
    }
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
      probeCfg,
      'sub'
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

    const qualityVariants = qualityVariantsFromCandidates(candidates);
    if (qualityVariants.length > 1) {
      body.quality_variants = qualityVariants;
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

  const anilistRaw = url.searchParams.get('anilist_id')?.trim();
  const anilistParsed = anilistRaw ? Number(anilistRaw) : NaN;
  const anilistId =
    Number.isFinite(anilistParsed) && anilistParsed > 0 ? Math.floor(anilistParsed) : null;

  if (!seriesId) {
    return {
      status: 400,
      body: {
        success: false,
        error:
          provider === 'aniliberty'
            ? 'ani_id is required (Aniliberty release id from catalog)'
            : provider === 'hikka'
              ? 'ani_id is required (Hikka slug from catalog)'
              : 'ani_id is required (Animepahe series id from catalog)',
      },
    };
  }

  const epTokenOverride = url.searchParams.get('ep_token')?.trim() || null;
  const episodeHasDubRaw = url.searchParams.get('episode_has_dub')?.trim().toLowerCase();
  let episodeHasDub: boolean | null = null;
  if (episodeHasDubRaw === '1' || episodeHasDubRaw === 'true') episodeHasDub = true;
  if (episodeHasDubRaw === '0' || episodeHasDubRaw === 'false') episodeHasDub = false;

  if (provider === 'aniliberty') {
    return computeAnilibertyWatchResolveOutcome({
      startedAt,
      episode,
      origin,
      seriesId,
      preferredHint,
      epTokenOverride,
      expectedEpisodes: parseExpectedEpisodesParam(url.searchParams),
      anilistStillAiring: url.searchParams.get('anilist_still_airing')?.trim() === '1',
    });
  }

  if (provider === 'hikka') {
    return computeHikkaWatchResolveOutcome({
      startedAt,
      episode,
      origin,
      hikkaSlug: seriesId,
      epTokenOverride,
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
    anilistId,
    epTokenOverride,
    episodeHasDub,
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
      ['watch-resolve-data-v8', cacheKey, publicOrigin],
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
