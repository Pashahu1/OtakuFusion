import { ANIKOTO_STREAM_CACHE_SECONDS } from '@/server/anikoto/config';
import { getAnikotoStreamCached } from '@/server/anikoto/streamCached';
import { anikotoConfigGuard, anikotoRouteError, parseAnikotoStreamParams } from '@/server/anikoto/routeHelpers';

export async function GET(req: Request) {
  const guard = anikotoConfigGuard();
  if (guard) return guard;

  const parsed = parseAnikotoStreamParams(new URL(req.url));
  if (!parsed.ok) {
    return Response.json(
      { error: parsed.error },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const payload = await getAnikotoStreamCached(parsed.params);
    return Response.json(payload, {
      headers: {
        'Cache-Control': `private, max-age=${ANIKOTO_STREAM_CACHE_SECONDS}`,
      },
    });
  } catch (e) {
    return anikotoRouteError(e, 'anikoto_stream_failed');
  }
}
