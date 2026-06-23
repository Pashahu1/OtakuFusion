/**
 * Edge HLS relay — optional alternative to Vercel `/api/m3u8-proxy`.
 * Avoids serverless buffering/timeouts on disguised CDN segments (Anikoto / sugevideo).
 *
 * Deploy: npx wrangler deploy (from this folder)
 * App env: NEXT_PUBLIC_M3U8_PROXY_BASE=https://<your-worker>.workers.dev
 */
const MAX_PLAYLIST_BYTES = 4 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 28_000;

const DEFAULT_UPSTREAM_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const DISGUISED_SEGMENT_PATH = /\/seg-\d+[-/]/i;
const BINARY_SEGMENT_EXT = /\.(ts|m4s|aac|mp4|webm|mkv)(\?|$)/i;
const DISGUISED_SEGMENT_EXT = /\.(jpg|jpeg|png|webp|ico|html|js|css|txt)(\?|$)/i;
const WEBVTT_EXT = /\.(vtt|srt)(\?|$)/i;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
  'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length, Content-Type',
};

function looksLikeHlsSegmentUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return false;
  if (BINARY_SEGMENT_EXT.test(raw)) return true;
  return DISGUISED_SEGMENT_PATH.test(raw) && DISGUISED_SEGMENT_EXT.test(raw);
}

function looksLikeWebVttUrl(url) {
  return WEBVTT_EXT.test(String(url || '').trim());
}

function looksLikePassthroughMediaUrl(url) {
  return looksLikeHlsSegmentUrl(url) || looksLikeWebVttUrl(url);
}

function hostnameLooksSafe(hostname) {
  const h = String(hostname || '').toLowerCase();
  if (!h || h === 'localhost' || h.endsWith('.localhost')) return false;
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\./.exec(h);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 10 || a === 127 || a === 0) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
  }
  return true;
}

function isTargetUrlAllowed(urlStr) {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    return hostnameLooksSafe(u.hostname);
  } catch {
    return false;
  }
}

function parseForwardHeaders(raw) {
  const text = String(raw || '{}').trim();
  if (!text) return {};
  try {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!String(k).trim()) continue;
      if (typeof v === 'string' && v.length > 0) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function mergeUpstreamHeaders(forwardHeaders) {
  const out = { ...DEFAULT_UPSTREAM_HEADERS };
  for (const [k, v] of Object.entries(forwardHeaders || {})) {
    if (String(k).toLowerCase() === 'origin') continue;
    out[k] = v;
  }
  return out;
}

function shouldForwardClientRange(targetUrl, rangeHeader) {
  const range = String(rangeHeader || '').trim();
  if (!range) return false;
  const normalized = range.toLowerCase();
  if (normalized === 'bytes=0-' || normalized === 'bytes=0') return false;
  if (/\.(ts|m4s|aac|mp4|webm|mkv|vtt|srt)(\?|$)/i.test(targetUrl)) return true;
  if (looksLikePassthroughMediaUrl(targetUrl)) return true;
  return /bytes=\d+-\d+/.test(normalized);
}

function buildForwardHeaders(request, fetchUrl, headersJson) {
  const forward = mergeUpstreamHeaders(parseForwardHeaders(headersJson));
  const range = request.headers.get('range');
  if (shouldForwardClientRange(fetchUrl, range)) {
    forward.Range = range;
  }
  return forward;
}

function looksLikeHlsPlaylist(buf) {
  const head = new Uint8Array(buf.slice(0, Math.min(buf.byteLength, 32)));
  const s = new TextDecoder('utf-8', { fatal: false }).decode(head);
  return s.includes('#EXTM3U');
}

function manifestBaseHref(targetUrl, finalUrl) {
  for (const candidate of [targetUrl, finalUrl]) {
    const c = String(candidate || '').trim();
    if (c) return c;
  }
  return finalUrl;
}

function buildProxyTargetUrl(requestUrl, upstreamHref, headersJson) {
  const u = new URL(requestUrl);
  u.search = '';
  u.searchParams.set('url', upstreamHref);
  if (String(headersJson || '').trim()) {
    u.searchParams.set('headers', headersJson);
  }
  return u.toString();
}

function rewriteLineUriAttributes(line, manifestHref, toProxyAbsolute) {
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

function rewriteM3u8Body(text, manifestHref, toProxyAbsolute) {
  const lines = text.split(/\r?\n/);
  const out = [];
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('#')) {
      out.push(
        trimmed.includes('URI=')
          ? rewriteLineUriAttributes(raw, manifestHref, toProxyAbsolute)
          : raw,
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

function shouldStreamPassthrough(fetchUrl, contentTypeRaw, parsedLen, ok, hasBody) {
  const contentTypeLower = String(contentTypeRaw || '').toLowerCase();
  return (
    ok &&
    hasBody &&
    (looksLikePassthroughMediaUrl(fetchUrl) ||
      /\.(ts|m4s|aac|mp4|webm|mkv)(\?|$)/i.test(fetchUrl) ||
      contentTypeLower.includes('video/mp4') ||
      contentTypeLower.includes('video/iso') ||
      contentTypeLower.includes('video/webm') ||
      contentTypeLower.includes('text/vtt') ||
      contentTypeLower.includes('application/x-subrip') ||
      (Number.isFinite(parsedLen) && parsedLen > MAX_PLAYLIST_BYTES))
  );
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) {
    headers.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleProxy(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url')?.trim();
  if (!targetUrl) {
    return withCors(
      Response.json({ error: 'Missing url query.' }, { status: 400 }),
    );
  }
  if (!isTargetUrlAllowed(targetUrl)) {
    return withCors(
      Response.json({ error: 'Target URL not allowed.' }, { status: 400 }),
    );
  }

  const headersJson = url.searchParams.get('headers') ?? '{}';
  const forwardHeaders = buildForwardHeaders(request, targetUrl, headersJson);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(targetUrl, {
      redirect: 'follow',
      headers: forwardHeaders,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'fetch failed';
    return withCors(Response.json({ error: message }, { status: 502 }));
  }

  const finalUrl = upstreamResponse.url || targetUrl;
  const contentTypeRaw =
    upstreamResponse.headers.get('content-type') ?? 'application/octet-stream';
  const contentLength = upstreamResponse.headers.get('content-length');
  const parsedLen = contentLength ? Number(contentLength) : NaN;

  if (
    shouldStreamPassthrough(
      targetUrl,
      contentTypeRaw,
      parsedLen,
      upstreamResponse.ok,
      Boolean(upstreamResponse.body),
    )
  ) {
    const headers = new Headers();
    headers.set('Content-Type', contentTypeRaw);
    headers.set('Cache-Control', 'private, max-age=120');
    const contentRange = upstreamResponse.headers.get('content-range');
    if (contentRange) headers.set('Content-Range', contentRange);
    const acceptRanges = upstreamResponse.headers.get('accept-ranges');
    if (acceptRanges) headers.set('Accept-Ranges', acceptRanges);
    if (contentLength) headers.set('Content-Length', contentLength);
    for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  }

  const buf = await upstreamResponse.arrayBuffer();
  if (!upstreamResponse.ok) {
    return withCors(
      new Response(buf, {
        status: upstreamResponse.status,
        headers: { 'Content-Type': contentTypeRaw },
      }),
    );
  }

  if (buf.byteLength <= MAX_PLAYLIST_BYTES && looksLikeHlsPlaylist(buf)) {
    const text = new TextDecoder('utf-8').decode(buf);
    const toProxyAbsolute = (up) => buildProxyTargetUrl(request.url, up, headersJson);
    try {
      const rewritten = rewriteM3u8Body(
        text,
        manifestBaseHref(targetUrl, finalUrl),
        toProxyAbsolute,
      );
      return withCors(
        new Response(rewritten, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpegurl; charset=utf-8',
            'Cache-Control': 'private, max-age=30',
          },
        }),
      );
    } catch {
      /* fall through */
    }
  }

  const fallbackHeaders = new Headers({ 'Content-Type': contentTypeRaw });
  fallbackHeaders.set('Cache-Control', 'private, max-age=120');
  for (const [k, v] of Object.entries(CORS_HEADERS)) fallbackHeaders.set(k, v);
  return new Response(buf, {
    status: upstreamResponse.status,
    headers: fallbackHeaders,
  });
}

const hlsRelayWorker = {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return withCors(
        Response.json({ error: 'Method not allowed.' }, { status: 405 }),
      );
    }
    return handleProxy(request);
  },
};

export default hlsRelayWorker;
