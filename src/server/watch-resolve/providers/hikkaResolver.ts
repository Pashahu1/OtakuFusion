import { decodeHikkaEpToken } from '@/lib/catalog/providers/hikka/hikkaEpToken';
import { fetchHikkaWatchV2 } from '@/lib/catalog/providers/hikka/hikkaFeaturesClient';
import {
  mapHikkaTeamEpisodes,
  pickDefaultHikkaCatalog,
} from '@/lib/catalog/providers/hikka/mapHikkaCatalog';
import { refererForHikkaPageUrl } from '@/lib/catalog/providers/hikka/extractPageM3u8';
import { HikkaFeaturesForbiddenError } from '@/lib/catalog/providers/hikka/hikkaOutboundFetch';
import { extractHikkaM3u8Cached } from '@/server/hikka/extractM3u8Cached';
import { pickEpisodeByNumber } from '@/server/watch-resolve/episodes';
import { watchResolveErrorOutcome } from '@/server/watch-resolve/outcome';
import { isPlayableViaProxy, readWatchProbeConfig } from '@/server/watch-resolve/probe';
import type { HikkaResolveParams, WatchResolveOutcome } from '@/server/watch-resolve/types';
import type { StreamingType } from '@/shared/types/StreamingTypes';

export async function computeHikkaWatchResolveOutcome(
  params: HikkaResolveParams
): Promise<WatchResolveOutcome> {
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
      // keep default
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
          reason:
            'Hikka Features API blocked this host. Configure HIKKA_FEATURES_RELAY_BASE on Vercel.',
        },
      };
    }
    return watchResolveErrorOutcome(error);
  }
}
