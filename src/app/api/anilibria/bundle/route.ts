import { getCachedAnilibriaWatchBundle } from '@/server/anilibria/loadWatchBundle';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const anilistId = url.searchParams.get('anilist_id')?.trim() ?? '';
  if (!anilistId) {
    return Response.json({ success: false, error: 'missing_anilist_id' }, { status: 400 });
  }

  try {
    const bundle = await getCachedAnilibriaWatchBundle(anilistId);
    if (!bundle.ok) {
      return Response.json({ success: false, error: bundle.error }, { status: 404 });
    }
    return Response.json(
      {
        success: true as const,
        alias: bundle.alias,
        release_id: bundle.releaseId,
        title: bundle.title,
        episodes: bundle.episodes,
        total_episodes: bundle.totalEpisodes,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (e) {
    return Response.json(
      {
        success: false as const,
        error: e instanceof Error ? e.message : 'anilibria_bundle_failed',
      },
      { status: 502 }
    );
  }
}
