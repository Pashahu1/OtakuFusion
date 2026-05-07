import type { NextRequest } from 'next/server';

/** Локальний проксі для HLS (.m3u8 + сегменти), щоб не залежати від зовнішніх сервісів на кшталт m3u8proxy.fly.dev. */
export const runtime = 'nodejs';

const MAX_PLAYLIST_BYTES = 4 * 1024 * 1024;

function hostnameLooksSafe(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost')) return false;

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\./.exec(h);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 10) return false;
    if (a === 127) return false;
    if (a === 0) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
  }
  return true;
}

function isTargetUrlAllowed(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return hostnameLooksSafe(u.hostname);
  } catch {
    return false;
  }
}

/** Базові заголовки «як браузер» — деякі CDN (megaup тощо) ріжуть голий Node fetch / 403. */
const DEFAULT_UPSTREAM_FETCH_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

function parseForwardHeaders(headersParam: string | null): Record<string, string> {
  const raw = (headersParam ?? '{}').trim();
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as unknown;
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (!k.trim()) continue;
      if (typeof v === 'string' && v.length > 0) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function mergeUpstreamHeaders(forwardHeaders: Record<string, string>): Record<string, string> {
  return { ...DEFAULT_UPSTREAM_FETCH_HEADERS, ...forwardHeaders };
}

function dropOriginHeader(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === 'origin') continue;
    out[key] = value;
  }
  return out;
}

function buildProxyTargetUrl(req: NextRequest, upstreamHref: string, headersJson: string): string {
  const selfPath = req.nextUrl.pathname;
  const u = new URL(selfPath, req.nextUrl.origin);
  u.search = '';
  u.searchParams.set('url', upstreamHref);
  if (headersJson.trim()) {
    u.searchParams.set('headers', headersJson);
  }
  return u.toString();
}

function rewriteLineUriAttributes(
  line: string,
  manifestHref: string,
  toProxyAbsolute: (up: string) => string
): string {
  return line
    .replace(/URI="([^"]+)"/gi, (_, uri) => {
      const resolved = new URL(String(uri).trim(), manifestHref).href;
      return `URI="${toProxyAbsolute(resolved)}"`;
    })
    .replace(/URI='([^']+)'/gi, (_, uri) => {
      const resolved = new URL(String(uri).trim(), manifestHref).href;
      return `URI='${toProxyAbsolute(resolved)}'`;
    });
}

function rewriteM3u8Body(
  text: string,
  manifestHref: string,
  toProxyAbsolute: (up: string) => string
): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  for (const raw of lines) {
    const trimmed = raw.trim();

    if (trimmed.startsWith('#')) {
      out.push(
        trimmed.includes('URI=')
          ? rewriteLineUriAttributes(raw, manifestHref, toProxyAbsolute)
          : raw
      );
      continue;
    }

    if (!trimmed) {
      out.push(raw);
      continue;
    }

    const resolved = new URL(trimmed, manifestHref).href;
    out.push(toProxyAbsolute(resolved));
  }
  return out.join('\n');
}

function looksLikeHlsPlaylist(buf: ArrayBuffer): boolean {
  const head = new Uint8Array(buf.slice(0, Math.min(buf.byteLength, 32)));
  const dec = new TextDecoder('utf-8', { fatal: false });
  const s = dec.decode(head);
  return s.includes('#EXTM3U');
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) {
    return Response.json({ error: 'Missing url query.' }, { status: 400 });
  }

  const targetUrl = urlParam.trim();

  if (!isTargetUrlAllowed(targetUrl)) {
    return Response.json({ error: 'Target URL not allowed.' }, { status: 400 });
  }

  const headersJson = req.nextUrl.searchParams.get('headers') ?? '{}';
  const forwardHeaders = mergeUpstreamHeaders(parseForwardHeaders(headersJson));

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      redirect: 'follow',
      headers: forwardHeaders,
    });
    if (!upstreamResponse.ok && forwardHeaders.Origin) {
      /**
       * Частина CDN відкидає Origin для HLS-запитів (особливо cross-site),
       * але пропускає ті самі запити лише з Referer.
       */
      const retryHeaders = dropOriginHeader(forwardHeaders);
      const retryRes = await fetch(targetUrl, {
        redirect: 'follow',
        headers: retryHeaders,
      });
      if (retryRes.ok) upstreamResponse = retryRes;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'fetch failed';
    return Response.json({ error: message }, { status: 502 });
  }

  const finalUrl = upstreamResponse.url || targetUrl;

  const contentTypeRaw =
    upstreamResponse.headers.get('content-type') ?? 'application/octet-stream';

  const contentLength = upstreamResponse.headers.get('content-length');
  const parsedLen = contentLength ? Number(contentLength) : NaN;

  /**
   * Відео/аудіо сегменти та дуже великі blob — стрімимо без повної буферизації.
   * Плейлисти (часто `octet-stream`) лишаємо в RAM лише до MAX_PLAYLIST_BYTES + rewrite.
   */
  const streamAsPassthrough =
    upstreamResponse.ok &&
    upstreamResponse.body &&
    (/\.(ts|m4s|aac|mp4|webm|mkv)(\?|$)/i.test(targetUrl) ||
      (Number.isFinite(parsedLen) && parsedLen > MAX_PLAYLIST_BYTES));

  if (streamAsPassthrough) {
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': contentTypeRaw,
        'Cache-Control': 'private, max-age=120',
      },
    });
  }

  const buf = await upstreamResponse.arrayBuffer();

  if (!upstreamResponse.ok) {
    return new Response(buf, {
      status: upstreamResponse.status,
      headers: { 'Content-Type': contentTypeRaw },
    });
  }

  if (buf.byteLength <= MAX_PLAYLIST_BYTES && looksLikeHlsPlaylist(buf)) {
    const text = new TextDecoder('utf-8').decode(buf);
    const toProxyAbsolute = (up: string) =>
      buildProxyTargetUrl(req, up, headersJson);
    try {
      const rewritten = rewriteM3u8Body(text, finalUrl, toProxyAbsolute);
      return new Response(rewritten, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpegurl; charset=utf-8',
          'Cache-Control': 'private, max-age=30',
        },
      });
    } catch {
      /* непарсений плейлист — віддаємо raw */
    }
  }

  return new Response(buf, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': contentTypeRaw,
      'Cache-Control': 'private, max-age=120',
    },
  });
}
