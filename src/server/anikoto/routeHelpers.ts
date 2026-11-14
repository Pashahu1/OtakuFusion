const NO_STORE = { 'Cache-Control': 'no-store' } as const;

/** Anikoto BFF is retired. Env (`ANIKOTO_API_BASE`) must not re-open these routes. */
export function anikotoGoneResponse(): Response {
  return Response.json(
    { error: 'anikoto_gone' },
    { status: 410, headers: NO_STORE },
  );
}

export function anikotoConfigGuard(): Response {
  return anikotoGoneResponse();
}

export function anikotoRouteError(e: unknown, fallback: string): Response {
  return Response.json(
    { error: e instanceof Error ? e.message : fallback },
    { status: 502, headers: NO_STORE }
  );
}

export function parseAnikotoStreamParams(url: URL):
  | { ok: true; params: { id: string; ep: string; server: 'hd-1' | 'hd-2'; type: 'sub' | 'dub' } }
  | { ok: false; error: string } {
  const id = url.searchParams.get('id')?.trim();
  const ep = url.searchParams.get('ep')?.trim();
  const server = url.searchParams.get('server')?.trim() ?? 'hd-2';
  const type = url.searchParams.get('type')?.trim() ?? 'sub';

  if (!id) return { ok: false, error: 'id is required' };
  if (!ep) return { ok: false, error: 'ep is required' };
  if (server !== 'hd-1' && server !== 'hd-2') {
    return { ok: false, error: 'server must be hd-1 or hd-2' };
  }
  if (type !== 'sub' && type !== 'dub') {
    return { ok: false, error: 'type must be sub or dub' };
  }

  return { ok: true, params: { id, ep, server, type } };
}
