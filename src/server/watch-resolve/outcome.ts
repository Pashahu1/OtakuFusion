import type { WatchResolveOutcome } from '@/server/watch-resolve/types';

export function outcomeToResponse(out: WatchResolveOutcome): Response {
  const headers: Record<string, string> =
    out.status === 200
      ? { 'Cache-Control': 'private, max-age=12, stale-while-revalidate=24' }
      : { 'Cache-Control': 'no-store' };
  return Response.json(out.body, { status: out.status, headers });
}

export class WatchResolveNonOkError extends Error {
  constructor(public readonly outcome: WatchResolveOutcome) {
    super('watch_resolve_non_ok');
    this.name = 'WatchResolveNonOkError';
  }
}

export function extractWatchResolveNonOkOutcome(err: unknown): WatchResolveOutcome | null {
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

export function watchResolveErrorOutcome(
  error: unknown,
  fallback = 'watch_resolve_failed'
): WatchResolveOutcome {
  return {
    status: 502,
    body: {
      success: false,
      error: error instanceof Error ? error.message : fallback,
    },
  };
}
