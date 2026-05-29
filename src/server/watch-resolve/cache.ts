import { unstable_cache } from 'next/cache';
import {
  extractWatchResolveNonOkOutcome,
  outcomeToResponse,
  WatchResolveNonOkError,
} from '@/server/watch-resolve/outcome';
import { canonicalResolveKey } from '@/server/watch-resolve/dedupe';
import type { WatchResolveOutcome } from '@/server/watch-resolve/types';

export function isWatchResolveDataCacheEnabled(): boolean {
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

export async function handleWatchResolveWithCache(
  req: Request,
  computeOutcome: (
    req: Request,
    options?: { publicOrigin: string }
  ) => Promise<WatchResolveOutcome>
): Promise<Response> {
  if (!isWatchResolveDataCacheEnabled()) {
    return outcomeToResponse(await computeOutcome(req));
  }

  const url = new URL(req.url);
  const cacheKey = canonicalResolveKey(url);
  const publicOrigin = url.origin;

  try {
    const fetchCached = unstable_cache(
      async () => {
        const replayHref = new URL(cacheKey, 'https://watch-resolve.replay');
        const syntheticReq = new Request(replayHref);
        const o = await computeOutcome(syntheticReq, { publicOrigin });
        if (o.status !== 200) throw new WatchResolveNonOkError(o);
        return o.body;
      },
      ['watch-resolve-data-v9-animepahe', cacheKey, publicOrigin],
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
    return outcomeToResponse(await computeOutcome(req));
  }
}
