/**
 * Публічний HLS-проксі (Next інлайнить `NEXT_PUBLIC_*` у клієнтський бандл).
 *
 * - **Локальний Next** `/api/m3u8-proxy`: `?url=` + `&headers=<json>`.
 * - **DeveloperJosh m3u8-proxy** (напр. `m3u8proxy.fly.dev`): шлях **`/fetch/?url=`** + **`&ref=`**, без `headers`.
 * - Якщо в env вказано `*.fly.dev`, а сайт відкритий на **localhost** — автоматично лишається **same-origin `/api/m3u8-proxy`**, бо публічний Fly часто віддає 404/403.
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
    /** Публічні інстанси DeveloperJosh/m3u8-proxy часто на `*.fly.dev` з «m3u8» у імені. */
    return h.endsWith('.fly.dev') && h.includes('m3u8');
  } catch {
    return false;
  }
}

function rawM3u8ProxyEnv(): string {
  return process.env.NEXT_PUBLIC_M3U8_PROXY_URL?.trim() ?? '';
}

/**
 * Публічні інстанси на Fly часто дають 403/404; на localhost надійніше тягнути через власний `/api/m3u8-proxy`.
 * `siteOrigin` — з `buildM3u8ProxyRequestUrl` (серверний probe); у браузері перевіряється `window.location`.
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
      /* відносний URL — лишаємо як є */
    }
  }
  if (!/[?&]url=/i.test(base)) {
    base += base.includes('?') ? '&url=' : '?url=';
  } else if (/[?&]url\s*$/i.test(base)) {
    base += '=';
  }
  return base;
}

/** Екземпляри m3u8-proxy (DeveloperJosh): pathname `/fetch` + query `url` + `ref`. */
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
 * Повний URL першого запиту плейлиста (як у плеєрі Artplayer / hls.js).
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

/** Абсолютний URL для серверного `fetch` (probe watch/resolve). */
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
