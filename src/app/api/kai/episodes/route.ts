import { getAnimeKaiEpisodesCached } from '@/server/kai/episodesCached';

function isSafeAniIdQuery(value: string | null): string | null {
  if (!value?.trim()) return null;
  const t = value.trim();
  if (t.length > 96) return null;
  if (/[\u0000-\u0020<>"]/.test(t)) return null;
  return t;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const aniId = isSafeAniIdQuery(url.searchParams.get('ani_id'));
  if (!aniId) {
    return Response.json(
      { error: 'ani_id is required and must be a safe identifier.' },
      { status: 400 }
    );
  }

  try {
    const body = await getAnimeKaiEpisodesCached(aniId);
    return Response.json(body, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'episodes_fetch_failed';
    return Response.json({ error: message }, { status: 502 });
  }
}
