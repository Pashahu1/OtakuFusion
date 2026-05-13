import { getCachedAnilibriaStream } from '@/server/anilibria/loadWatchBundle';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const alias = url.searchParams.get('alias')?.trim() ?? '';
  const epRaw = url.searchParams.get('episode')?.trim() ?? '';
  const episode = Number(epRaw);

  if (!alias) {
    return Response.json({ success: false, error: 'missing_alias' }, { status: 400 });
  }
  if (!Number.isFinite(episode) || episode < 1) {
    return Response.json({ success: false, error: 'invalid_episode' }, { status: 400 });
  }

  try {
    const stream = await getCachedAnilibriaStream(alias, episode);
    if (!stream.ok) {
      return Response.json({ success: false, error: stream.error }, { status: 404 });
    }
    return Response.json(
      {
        success: true as const,
        url: stream.url,
        intro: stream.intro,
        outro: stream.outro,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (e) {
    return Response.json(
      {
        success: false as const,
        error: e instanceof Error ? e.message : 'anilibria_stream_failed',
      },
      { status: 502 }
    );
  }
}
