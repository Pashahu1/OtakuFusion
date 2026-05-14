import { NextRequest, NextResponse } from 'next/server';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';
const MAX_BODY_BYTES = 200_000;

/**
 * Проксі GraphQL AniList для клієнта: браузерні `fetch` на graphql.anilist.co блокуються CORS.
 * Серверні виклики йдуть напряму з `anilist.ts` без цього маршруту.
 */
export async function POST(req: NextRequest) {
  const len = req.headers.get('content-length');
  if (len != null && Number(len) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const query = rec.query;
  const variables = rec.variables;

  if (typeof query !== 'string' || !query.trim()) {
    return NextResponse.json({ error: 'query_required' }, { status: 400 });
  }

  const upstream = await fetch(ANILIST_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'OtakuFusion/1.0 (Next.js AniList proxy)',
    },
    body: JSON.stringify({
      query,
      variables:
        variables != null && typeof variables === 'object' && !Array.isArray(variables)
          ? variables
          : undefined,
    }),
  });

  const text = await upstream.text();
  const contentType =
    upstream.headers.get('content-type')?.split(';')[0]?.trim() || 'application/json';

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, no-store',
    },
  });
}
