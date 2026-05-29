/**
 * Public HLS proxy (Next inlines `NEXT_PUBLIC_*` into client bundle).
 *
 * - **Local Next** `/api/m3u8-proxy`: `?url=` + `&headers=<json>`.
 * - **DeveloperJosh m3u8-proxy** (e.g. `m3u8proxy.fly.dev`): path **`/fetch/?url=`** + **`&ref=`**, no `headers`.
 * - If env points to `*.fly.dev` but site is on **localhost** — auto **same-origin `/api/m3u8-proxy`**, because public Fly often returns 404/403.
 */

function isBareOriginHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    if (!/^https?:$/i.test(u.protocol)) return false;
    const p = u.pathname.replace(/\/+$/, '') || '/';
    return p === '/';
  } catch {
    return false;
  }
}

function shouldAutoFetchForDeveloperJoshFlyStyle(originUrl: string): boolean {
  try {
    const u = new URL(originUrl);
    const h = u.hostname.toLowerCase();
    /** Public DeveloperJosh/m3u8-proxy instances often on `*.fly.dev` with "m3u8" in hostname. */
    return h.endsWith('.fly.dev') && h.includes('m3u8');
  } catch {
    return false;
  }
}

function rawM3u8ProxyEnv(): string {
  return process.env.NEXT_PUBLIC_M3U8_PROXY_URL?.trim() ?? '';
}

/**
 * Public Fly instances often return 403/404; on localhost prefer own `/api/m3u8-proxy`.
 * `siteOrigin` — from `buildM3u8ProxyRequestUrl` (server probe); in browser uses `window.location`.
 */
function shouldForceSameOriginM3u8Proxy(siteOrigin?: string): boolean {
  const raw = rawM3u8ProxyEnv();
  if (!raw || !raw.toLowerCase().includes('.fly.dev')) return false;
  if (siteOrigin) {
    try {
      const h = new URL(siteOrigin).hostname.toLowerCase();
      if (h === 'localhost' || h === '127.0.0.1') return true;
    } catch {
      /* ignore */
    }
  }
  if (typeof window !== 'undefined') {
    const h = window.location.hostname.toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1') return true;
  }
  return false;
}

export function getM3u8ProxyUrlPrefix(siteOrigin?: string): string {
  if (shouldForceSameOriginM3u8Proxy(siteOrigin)) {
    return '/api/m3u8-proxy?url=';
  }
  const raw = rawM3u8ProxyEnv();
  if (!raw) {
    return '/api/m3u8-proxy?url=';
  }
  let base = raw.replace(/\/+$/, '');
  if (isBareOriginHttpsUrl(base) && shouldAutoFetchForDeveloperJoshFlyStyle(base)) {
    const u = new URL(base);
    base = `${u.origin}/fetch/`;
  } else {
    try {
      const u = new URL(base);
      const norm = u.pathname.replace(/\/+$/, '') || '/';
      if (norm === '/fetch') {
        base = `${u.origin}/fetch/`;
      }
    } catch {
      /* relative URL — leave as-is */
    }
  }
  if (!/[?&]url=/i.test(base)) {
    base += base.includes('?') ? '&url=' : '?url=';
  } else if (/[?&]url\s*$/i.test(base)) {
    base += '=';
  }
  return base;
}

/** m3u8-proxy instances (DeveloperJosh): pathname `/fetch` + query `url` + `ref`. */
function usesDevJoshFetchStyle(prefix: string): boolean {
  if (!/^https?:\/\//i.test(prefix)) return false;
  try {
    const originAndPath = prefix.split(/[?&]/)[0] ?? prefix;
    const u = new URL(originAndPath);
    const p = u.pathname.replace(/\/+$/, '') || '/';
    return p === '/fetch';
  } catch {
    return false;
  }
}

/**
 * Full URL of first playlist request (as in Artplayer / hls.js player).
 */
export function buildM3u8ProxyPlaylistUrl(
  streamUrl: string,
  headers: Record<string, string>,
  siteOrigin?: string
): string {
  const prefix = getM3u8ProxyUrlPrefix(siteOrigin);
  const enc = encodeURIComponent(streamUrl);
  if (usesDevJoshFetchStyle(prefix)) {
    const ref = (headers.Referer || headers.referer || 'https://kwik.cx/').trim();
    return `${prefix}${enc}&ref=${encodeURIComponent(ref)}`;
  }
  return `${prefix}${enc}&headers=${encodeURIComponent(JSON.stringify(headers))}`;
}

/** Absolute URL for server `fetch` (probe watch/resolve). */
export function buildM3u8ProxyRequestUrl(
  origin: string,
  streamUrl: string,
  headers: Record<string, string>
): string {
  const prefix = getM3u8ProxyUrlPrefix(origin).trim();
  if (/^https?:\/\//i.test(prefix)) {
    return buildM3u8ProxyPlaylistUrl(streamUrl, headers);
  }
  const u = new URL('/api/m3u8-proxy', origin);
  u.searchParams.set('url', streamUrl);
  u.searchParams.set('headers', JSON.stringify(headers));
  return u.toString();
}
