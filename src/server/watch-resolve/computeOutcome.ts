import {
  getNormalizedLang,
  getStreamProvider,
  missingSeriesIdError,
  parseEpisodeNumber,
} from '@/server/watch-resolve/params';
import { computeAnikotoWatchResolveOutcome } from '@/server/watch-resolve/providers/anikotoResolver';
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

  const origin = options?.publicOrigin ?? url.origin;

  const seriesId = url.searchParams.get('ani_id')?.trim();
  const provider = getStreamProvider(url.searchParams);

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

  if (provider === 'hikka') {
    return computeHikkaWatchResolveOutcome({
      startedAt,
      episode,
      origin,
      hikkaSlug: seriesId,
      epTokenOverride,
    });
  }

  if (provider === 'anikoto') {
    return computeAnikotoWatchResolveOutcome({
      startedAt,
      episode,
      origin,
      anikotoSlug: seriesId,
      lang,
    });
  }

  return {
    status: 400,
    body: {
      success: false,
      error: 'unsupported stream_provider',
    },
  };
}
