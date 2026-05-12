import { getAnimeKaiServersCached } from '@/server/kai/serversCached';

function isSafeTokenQuery(value: string | null): string | null {
  if (!value?.trim()) return null;
  const t = value.trim();
  if (t.length < 2 || t.length > 512) return null;
  if (/[\u0000-\u0020<>"]/.test(t)) return null;
  return t;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const token = isSafeTokenQuery(url.searchParams.get('token'));
  if (!token) {
    return Response.json(
      { error: 'token is required and must be a non-whitespace string (2–512 chars).' },
      { status: 400 }
    );
  }

  try {
    const body = await getAnimeKaiServersCached(token);
    return Response.json(body, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'servers_fetch_failed';
    return Response.json({ error: message }, { status: 502 });
  }
}
