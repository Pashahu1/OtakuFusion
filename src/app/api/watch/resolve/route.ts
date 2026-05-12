import { getAnimeKaiEpisodesCached } from '@/server/kai/episodesCached';
import { getAnimeKaiServersCached } from '@/server/kai/serversCached';
import { getStreamInfo } from '@/services/getStreamInfo';
import {
  resolveAnimeKaiAniId,
  tryResolveAnimeKaiByAnilistId,
  tryResolveAnimeKaiByMalId,
} from '@/services/animekaiResolve';
import {
  buildProbeHeaders,
  isPlayableViaProxy,
  readWatchProbeConfig,
  type WatchProbeConfig,
} from '@/lib/watchResolveProbe';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import { mirrorServerLabel } from '@/shared/data/servers';
import type { StreamingType } from '@/shared/types/StreamingTypes';

type WatchLang = 'sub' | 'dub';

/** Одночасні однакові GET з різних вкладок — один прохід резолву на інстанс. */
const inflightResolve = new Map<string, Promise<Response>>();

function canonicalResolveKey(reqUrl: URL): string {
  const entries = [...reqUrl.searchParams.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const sp = new URLSearchParams(entries);
  return `${reqUrl.pathname}?${sp.toString()}`;
}

function getNormalizedLang(sp: URLSearchParams): WatchLang {
  const raw = sp.get('lang') ?? sp.get('language');
  return raw?.trim().toLowerCase() === 'dub' ? 'dub' : 'sub';
}

function parseEpisodeNumber(sp: URLSearchParams): number | null {
  const value = Number(sp.get('episode') ?? '');
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}

function parsePositiveInt(sp: URLSearchParams, key: string): number | undefined {
  const raw = sp.get(key)?.trim();
  if (!raw) return undefined;
  if (!/^\d+$/.test(raw)) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return value;
}

function pickEpisodeByNumber(episodes: EpisodesTypes[], episodeNo: number): EpisodesTypes | null {
  const exact = episodes.find((ep) => ep.episode_no === episodeNo);
  if (exact) return exact;
  /** `episodeMapping` / BFF ставлять `data_id` = номеру епізоду — запасний збіг. */
  return episodes.find((ep) => ep.data_id === episodeNo) ?? null;
}

function isSoftsubServer(server: ServerInfo): boolean {
  return server.serverName.trim().toLowerCase().startsWith('softsub');
}

function isDubServer(server: ServerInfo): boolean {
  return server.type.toLowerCase() === 'dub';
}

function isSubServer(server: ServerInfo): boolean {
  return server.type.toLowerCase() === 'sub' && !isSoftsubServer(server);
}

function buildServerCandidateGroups(
  servers: ServerInfo[],
  requestedLang: WatchLang
): ServerInfo[][] {
  const dub = servers.filter((server) => isDubServer(server));
  const softsub = servers.filter((server) => isSoftsubServer(server));
  const sub = servers.filter((server) => isSubServer(server));
  const ordered =
    requestedLang === 'dub' ? [dub, softsub, sub] : [sub, softsub, dub];
  const unique = new Set<string>();
  const dedupedGroups: ServerInfo[][] = [[], [], []];
  for (let i = 0; i < ordered.length; i++) {
    for (const server of ordered[i]) {
      const key = `${server.type}|${server.server_id}|${server.link_id ?? ''}|${server.serverName}`;
      if (unique.has(key)) continue;
      unique.add(key);
      dedupedGroups[i].push(server);
    }
  }
  return dedupedGroups;
}

function findPreferredServerInGroups(
  groups: ServerInfo[][],
  hint: string
): ServerInfo | null {
  const raw = hint.trim();
  if (!raw) return null;
  const hintLower = raw.toLowerCase();
  const hintMirror = mirrorServerLabel(raw).toLowerCase();

  for (const group of groups) {
    for (const s of group) {
      if (s.serverName.trim().toLowerCase() === hintLower) return s;
    }
  }
  for (const group of groups) {
    for (const s of group) {
      if (mirrorServerLabel(s.serverName).toLowerCase() === hintMirror) return s;
    }
  }
  return null;
}

async function tryResolveServerCandidate(
  candidate: ServerInfo,
  origin: string,
  probeCfg: WatchProbeConfig
): Promise<{ candidate: ServerInfo; primary: StreamingType }> {
  const streamData = await getStreamInfo(
    candidate,
    candidate.type.toLowerCase() === 'dub' ? 'dub' : 'sub'
  );
  const links = streamData.streamingLink ?? [];
  if (!links.length) {
    throw new Error('source_missing_url');
  }
  const withFile = links.filter((link) => link?.link?.file?.trim());
  if (!withFile.length) {
    throw new Error('source_missing_url');
  }

  try {
    const primary = await Promise.any(
      withFile.map(async (link) => {
        const ok = await isPlayableViaProxy(origin, link, probeCfg);
        if (!ok) throw new Error('not_playable');
        return link;
      })
    );
    return { candidate, primary };
  } catch {
    throw new Error('source_not_playable_via_proxy');
  }
}

async function resolveFirstWorkingStream(
  candidateGroups: ServerInfo[][],
  origin: string,
  probeCfg: WatchProbeConfig
) {
  let lastError: unknown = null;
  for (const group of candidateGroups) {
    if (!group.length) continue;
    const tasks = group.map((candidate) =>
      tryResolveServerCandidate(candidate, origin, probeCfg)
    );
    try {
      return await Promise.any(tasks);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('no_working_source');
}

function extractKeyword(sp: URLSearchParams): string | undefined {
  const keyword = sp.get('keyword')?.trim();
  if (keyword && keyword.length >= 2) return keyword;
  const localAnimeId = sp.get('local_anime_id')?.trim();
  if (localAnimeId && localAnimeId.length >= 2) return localAnimeId;
  return undefined;
}

async function handleWatchResolve(req: Request): Promise<Response> {
  const startedAt = Date.now();
  const url = new URL(req.url);
  const lang = getNormalizedLang(url.searchParams);
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

  const probeCfg = readWatchProbeConfig();
  const origin = url.origin;

  try {
    const explicitAniId = url.searchParams.get('ani_id')?.trim();
    const anilistId = parsePositiveInt(url.searchParams, 'anilist_id');
    const malId = parsePositiveInt(url.searchParams, 'mal_id');
    const keyword = extractKeyword(url.searchParams);
    const terms = keyword ? [keyword] : [];
    let resolvedBy: 'cache' | 'direct_anilist' | 'direct_mal' | 'fuzzy_last_resort' =
      'fuzzy_last_resort';
    let resolved: { ani_id: string; slug: string } | null =
      explicitAniId && explicitAniId.length > 0
        ? { ani_id: explicitAniId, slug: explicitAniId }
        : null;

    if (resolved) {
      resolvedBy = 'cache';
    } else {
      resolved = anilistId != null ? await tryResolveAnimeKaiByAnilistId(String(anilistId)) : null;
      if (!resolved && malId != null) {
        resolved = await tryResolveAnimeKaiByMalId(malId);
        resolvedBy = 'direct_mal';
      } else if (resolved && anilistId != null) {
        resolvedBy = 'direct_anilist';
      }

      if (!resolved) {
        if (!terms.length) {
          return Response.json(
            {
              success: false,
              error:
                'Cannot resolve anime: provide ani_id, anilist_id, mal_id, or keyword/local_anime_id.',
            },
            { status: 400 }
          );
        }
        resolved = await resolveAnimeKaiAniId(terms);
        resolvedBy = 'fuzzy_last_resort';
      }
    }

    const episodesResult = await getAnimeKaiEpisodesCached(resolved.ani_id);
    const targetEpisode = pickEpisodeByNumber(episodesResult.episodes, episode);
    if (!targetEpisode?.ep_token?.trim()) {
      return Response.json(
        {
          success: false,
          error: 'episode_not_found',
          reason: `Episode ${episode} is missing or has no ep_token`,
        },
        { status: 404 }
      );
    }

    const servers = await getAnimeKaiServersCached(targetEpisode.ep_token);
    if (!servers.length) {
      return Response.json(
        {
          success: false,
          error: 'no_servers',
          reason: 'No servers found for this episode token',
        },
        { status: 404 }
      );
    }

    const candidateGroups = buildServerCandidateGroups(servers, lang);
    if (candidateGroups.every((group) => group.length === 0)) {
      return Response.json(
        {
          success: false,
          error: 'no_working_source',
          reason: 'no_candidate_servers',
        },
        { status: 404 }
      );
    }

    const preferredHint = url.searchParams.get('preferred_server_hint')?.trim();
    let resolvedPair: { candidate: ServerInfo; primary: StreamingType };
    if (preferredHint) {
      const pref = findPreferredServerInGroups(candidateGroups, preferredHint);
      if (pref) {
        try {
          resolvedPair = await tryResolveServerCandidate(pref, origin, probeCfg);
        } catch {
          resolvedPair = await resolveFirstWorkingStream(
            candidateGroups,
            origin,
            probeCfg
          );
        }
      } else {
        resolvedPair = await resolveFirstWorkingStream(
          candidateGroups,
          origin,
          probeCfg
        );
      }
    } else {
      resolvedPair = await resolveFirstWorkingStream(
        candidateGroups,
        origin,
        probeCfg
      );
    }
    const { candidate, primary } = resolvedPair;
    const usedLang: WatchLang = candidate.type.toLowerCase() === 'dub' ? 'dub' : 'sub';
    const fallbackApplied =
      (lang === 'dub' && !isDubServer(candidate)) ||
      (lang === 'sub' && isDubServer(candidate));

    const body = {
      success: true as const,
      resolved_anime: {
        ani_id: resolved.ani_id,
        slug: resolved.slug,
        status: 'verified' as const,
        resolved_by: resolvedBy,
      },
      episode: {
        number: episode,
        ep_token: targetEpisode.ep_token,
        hasSub: Boolean(targetEpisode.hasSub ?? true),
        hasDub: Boolean(targetEpisode.hasDub ?? false),
      },
      stream: {
        url: primary.link.file,
        lang: usedLang,
        server: primary.server,
        request_headers: buildProbeHeaders(primary),
        tracks: primary.tracks ?? [],
        intro: primary.intro ?? { start: 0, end: 0 },
        outro: primary.outro ?? { start: 0, end: 0 },
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

    return Response.json(body, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=12, stale-while-revalidate=24',
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'watch_resolve_failed',
      },
      { status: 502 }
    );
  }
}

export async function GET(req: Request) {
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
  return pending;
}
