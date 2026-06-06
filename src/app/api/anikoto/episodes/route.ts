import { anikotoEpisodes } from '@/server/anikoto/client';
import { anikotoConfigGuard, anikotoRouteError } from '@/server/anikoto/routeHelpers';

export async function GET(req: Request) {
  const guard = anikotoConfigGuard();
  if (guard) return guard;

  const url = new URL(req.url);
  const id = url.searchParams.get('id')?.trim();
  if (!id) {
    return Response.json(
      { error: 'id is required' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const payload = await anikotoEpisodes(id);
    return Response.json(payload, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return anikotoRouteError(e, 'anikoto_episodes_failed');
  }
}
