import { buildCatalogSearchTermsFromFields } from '@/lib/catalog/catalog-hints';
import {
  getPlaybackAudio,
  getStreamProvider,
  missingSeriesIdError,
  parseEpisodeNumber,
  readAnikotoMatchQuery,
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
  const playbackAudio = getPlaybackAudio(url.searchParams);

  if (playbackAudio === 'ja' || playbackAudio === 'en') {
    const match = readAnikotoMatchQuery(url.searchParams);
    if (!match) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'keyword is required for Japanese or English audio',
        },
      };
    }
    return computeAnikotoWatchResolveOutcome({
      startedAt,
      episode,
      origin,
      audio: playbackAudio,
      match,
    });
  }

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

  const titleTerms = buildCatalogSearchTermsFromFields({
    title: url.searchParams.get('keyword')?.trim() || url.searchParams.get('title')?.trim() || '',
    romaji_title: url.searchParams.get('romaji_title')?.trim() || undefined,
    japanese_title: url.searchParams.get('japanese_title')?.trim() || undefined,
    synonyms: url.searchParams.get('synonyms')?.trim() || undefined,
  });

  return computeHikkaWatchResolveOutcome({
    startedAt,
    episode,
    origin,
    hikkaSlug: seriesId,
    epTokenOverride,
    titleTerms,
  });
}
