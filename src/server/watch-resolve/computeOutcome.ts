import { readWatchProbeConfig } from '@/server/watch-resolve/probe';
import {
  getNormalizedLang,
  getStreamProvider,
  missingSeriesIdError,
  parseAnilistId,
  parseEpisodeHasDub,
  parseEpisodeNumber,
  parseExpectedEpisodesParam,
} from '@/server/watch-resolve/params';
import { computeAnimepaheWatchResolveOutcome } from '@/server/watch-resolve/providers/animepaheResolver';
import { computeAnilibertyWatchResolveOutcome } from '@/server/watch-resolve/providers/anilibertyResolver';
import { computeHikkaWatchResolveOutcome } from '@/server/watch-resolve/providers/hikkaResolver';
import type { WatchResolveOutcome } from '@/server/watch-resolve/types';

/** Dispatches to provider strategy after shared request validation. */
export async function computeWatchResolveOutcome(
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
  const anilistId = parseAnilistId(url.searchParams);

  if (!seriesId) {
    return {
      status: 400,
      body: {
        success: false,
        error: missingSeriesIdError(provider),
      },
    };
  }

  const epTokenOverride = url.searchParams.get('ep_token')?.trim() || null;
  const episodeHasDub = parseEpisodeHasDub(url.searchParams);

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
    anilistId,
    epTokenOverride,
    episodeHasDub,
  });
}
