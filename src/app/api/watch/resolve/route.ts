import { getEpisodes } from '@/services/getEpisodes';
import { getServers } from '@/services/getServers';
import { getStreamInfo } from '@/services/getStreamInfo';
import {
  resolveAnimeKaiAniId,
  tryResolveAnimeKaiByAnilistId,
  tryResolveAnimeKaiByMalId,
} from '@/services/animekaiResolve';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { StreamingType } from '@/shared/types/StreamingTypes';

type WatchLang = 'sub' | 'dub';

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
  return episodes.find((ep) => ep.episode_no === episodeNo) ?? null;
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

function buildProbeHeaders(stream: StreamingType): Record<string, string> {
  const iframe = stream.iframe?.trim();
  if (iframe) {
    try {
      const url = new URL(iframe);
      return {
        Referer: `${url.origin}/`,
        Origin: url.origin,
      };
    } catch {
      // ignore malformed iframe and use fallback headers
    }
  }
  return {
    Referer: 'https://anikai.to/',
    Origin: 'https://anikai.to',
  };
}

async function isPlayableViaProxy(req: Request, stream: StreamingType): Promise<boolean> {
  const streamUrl = stream.link?.file?.trim();
  if (!streamUrl) return false;
  const origin = new URL(req.url).origin;
  const probeUrl = new URL('/api/m3u8-proxy', origin);
  probeUrl.searchParams.set('url', streamUrl);
  probeUrl.searchParams.set('headers', JSON.stringify(buildProbeHeaders(stream)));
  try {
    const res = await fetch(probeUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return false;
    const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
    const isPlaylist =
      contentType.includes('mpegurl') ||
      contentType.includes('vnd.apple.mpegurl') ||
      contentType.includes('application/octet-stream');
    if (!isPlaylist) return false;

    const text = await res.text();
    if (!text.includes('#EXTM3U')) return false;
    if (!text.includes('#EXT-X-STREAM-INF')) return true;

    /**
     * Для master playlist перевіряємо ще перший variant playlist,
     * бо часто master = 200, а рівні 403 і плеєр починає нескінченно ретраїти.
     */
    const firstVariant = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith('#'));
    if (!firstVariant) return false;
    const variantProbeUrl = new URL(firstVariant, probeUrl.toString());
    const variantRes = await fetch(variantProbeUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    return variantRes.ok;
  } catch {
    return false;
  }
}

async function tryResolveServerCandidate(
  candidate: ServerInfo,
  req: Request
): Promise<{ candidate: ServerInfo; primary: StreamingType }> {
  const streamData = await getStreamInfo(
    candidate,
    candidate.type.toLowerCase() === 'dub' ? 'dub' : 'sub'
  );
  const links = streamData.streamingLink ?? [];
  if (!links.length) {
    throw new Error('source_missing_url');
  }
  for (const link of links) {
    if (!link?.link?.file?.trim()) continue;
    if (!(await isPlayableViaProxy(req, link))) continue;
    return { candidate, primary: link };
  }
  throw new Error('source_not_playable_via_proxy');
}

async function resolveFirstWorkingStream(
  candidateGroups: ServerInfo[][],
  req: Request
) {
  let lastError: unknown = null;
  for (const group of candidateGroups) {
    if (!group.length) continue;
    const tasks = group.map((candidate) => tryResolveServerCandidate(candidate, req));
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

export async function GET(req: Request) {
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

    const episodesResult = await getEpisodes(resolved.ani_id);
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

    const servers = await getServers(targetEpisode.ep_token);
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

    const { candidate, primary } = await resolveFirstWorkingStream(candidateGroups, req);
    const usedLang: WatchLang = candidate.type.toLowerCase() === 'dub' ? 'dub' : 'sub';
    const fallbackApplied =
      (lang === 'dub' && !isDubServer(candidate)) ||
      (lang === 'sub' && isDubServer(candidate));

    return Response.json(
      {
        success: true,
        resolved_anime: {
          ani_id: resolved.ani_id,
          slug: resolved.slug,
          status: 'verified',
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
      },
      { status: 200 }
    );
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
