import { getCachedAnilibriaMatch } from '@/server/anilibria/loadWatchBundle';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const anilistId = url.searchParams.get('anilist_id')?.trim() ?? '';
  if (!anilistId) {
    return Response.json({ success: false, error: 'missing_anilist_id' }, { status: 400 });
  }

  try {
    const m = await getCachedAnilibriaMatch(anilistId);
    if (!m.ok) {
      return Response.json({ success: false, error: m.error ?? 'no_match' }, { status: 404 });
    }
    return Response.json(
      { success: true as const, alias: m.alias },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=120, stale-while-revalidate=240',
        },
      }
    );
  } catch (e) {
    return Response.json(
      {
        success: false as const,
        error: e instanceof Error ? e.message : 'anilibria_match_failed',
      },
      { status: 502 }
    );
  }
}
