import { handleWatchResolveWithCache } from '@/server/watch-resolve/cache';
import { computeWatchResolveOutcome } from '@/server/watch-resolve/computeOutcome';
import {
  canonicalResolveKey,
  getOrCreateInflightResolve,
} from '@/server/watch-resolve/dedupe';
import { parseEpisodeNumber } from '@/server/watch-resolve/params';

async function handleWatchResolve(req: Request): Promise<Response> {
  return handleWatchResolveWithCache(req, computeWatchResolveOutcome);
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
    return await getOrCreateInflightResolve(key, () => handleWatchResolve(req));
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
