const DEFAULT_ANIMEKAI_API = 'https://animekai.fly.dev';

function getAnimekaiBaseUrl(): string {
  const raw = process.env.ANIMEKAI_API_URL ?? process.env.NEXT_PUBLIC_ANIMEKAI_API_URL;
  return (raw?.trim() || DEFAULT_ANIMEKAI_API).replace(/\/+$/, '');
}

function getMappingAdminSecret(): string {
  return process.env.MAPPING_ADMIN_SECRET?.trim() ?? '';
}

export async function proxyAnimekaiProtected(
  backendPath: string,
  body: unknown
): Promise<Response> {
  const secret = getMappingAdminSecret();
  if (!secret) {
    return Response.json(
      { error: 'MAPPING_ADMIN_SECRET is not configured.' },
      { status: 500 }
    );
  }

  const baseUrl = getAnimekaiBaseUrl();
  const target = `${baseUrl}${backendPath.startsWith('/') ? backendPath : `/${backendPath}`}`;

  const res = await fetch(target, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  });

  const text = await res.text();
  const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
  if (contentType.includes('application/json')) {
    try {
      return new Response(text, {
        status: res.status,
        headers: { 'content-type': 'application/json' },
      });
    } catch {
      return Response.json({ error: 'Invalid JSON from backend.' }, { status: 502 });
    }
  }

  return new Response(text, {
    status: res.status,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
