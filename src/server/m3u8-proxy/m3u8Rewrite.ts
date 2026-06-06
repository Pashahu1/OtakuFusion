import type { NextRequest } from 'next/server';
import { readM3u8ProxyRelayBase } from '@/lib/m3u8ProxyPublicBase';
import { decodeStreamUrlForInspection, unwrapCrysolinePlaybackUrl } from '@/lib/streamMediaType';

import { looksLikePassthroughMediaUrl } from './segmentDetect';

export const MAX_PLAYLIST_BYTES = 4 * 1024 * 1024;

const PROXY_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Expose-Headers':
    'Content-Range, Accept-Ranges, Content-Length, Content-Type',
};

function withProxyCors(headers: Headers): Headers {
  const next = new Headers(headers);
  for (const [key, value] of Object.entries(PROXY_CORS_HEADERS)) {
    next.set(key, value);
  }
  return next;
}

function manifestBaseHref(targetUrl: string, finalUrl: string): string {
  const fromTarget = decodeStreamUrlForInspection(targetUrl);
  const fromFinal = decodeStreamUrlForInspection(finalUrl);
  for (const candidate of [fromTarget, fromFinal, finalUrl, targetUrl]) {
    const c = candidate.trim();
    if (!c) continue;
    const lower = c.toLowerCase();
    if (lower.includes('proxy.crysoline') || lower.includes('crysoline.moe/proxy')) {
      continue;
    }
    return c;
  }
  return finalUrl;
}

function buildProxyTargetUrl(
  req: NextRequest,
  upstreamHref: string,
  headersJson: string,
): string {
  const selfPath = req.nextUrl.pathname;
  const relayBase = readM3u8ProxyRelayBase();
  const u = new URL(selfPath, `${relayBase ?? req.nextUrl.origin}/`);
  u.search = '';
  u.searchParams.set('url', unwrapCrysolinePlaybackUrl(upstreamHref) || upstreamHref);
  if (headersJson.trim()) {
    u.searchParams.set('headers', headersJson);
  }
  return u.toString();
}

function rewriteLineUriAttributes(
  line: string,
  manifestHref: string,
  toProxyAbsolute: (up: string) => string,
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

export function rewriteM3u8Body(
  text: string,
  manifestHref: string,
  toProxyAbsolute: (up: string) => string,
): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
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

export function looksLikeHlsPlaylist(buf: ArrayBuffer): boolean {
  const head = new Uint8Array(buf.slice(0, Math.min(buf.byteLength, 32)));
  const dec = new TextDecoder('utf-8', { fatal: false });
  const s = dec.decode(head);
  return s.includes('#EXTM3U');
}

export function tryRewritePlaylistResponse(
  req: NextRequest,
  buf: ArrayBuffer,
  fetchUrl: string,
  finalUrl: string,
  headersJson: string,
): Response | null {
  if (buf.byteLength > MAX_PLAYLIST_BYTES || !looksLikeHlsPlaylist(buf)) {
    return null;
  }

  const text = new TextDecoder('utf-8').decode(buf);
  const toProxyAbsolute = (up: string) => buildProxyTargetUrl(req, up, headersJson);
  try {
    const rewritten = rewriteM3u8Body(text, manifestBaseHref(fetchUrl, finalUrl), toProxyAbsolute);
    return new Response(rewritten, {
      status: 200,
      headers: withProxyCors(
        new Headers({
          'Content-Type': 'audio/mpegurl; charset=utf-8',
          'Cache-Control': 'private, max-age=30',
        }),
      ),
    });
  } catch {
    return null;
  }
}

export function upstreamFetchUrl(targetUrl: string): string {
  const unwrapped = unwrapCrysolinePlaybackUrl(targetUrl);
  return unwrapped || targetUrl;
}

export function shouldStreamPassthrough(
  fetchUrl: string,
  contentTypeRaw: string,
  parsedLen: number,
  ok: boolean,
  hasBody: boolean,
): boolean {
  const contentTypeLower = contentTypeRaw.toLowerCase();
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

export function passthroughResponse(upstreamResponse: Response, contentTypeRaw: string): Response {
  const passthroughHeaders = new Headers();
  passthroughHeaders.set('Content-Type', contentTypeRaw);
  passthroughHeaders.set('Cache-Control', 'private, max-age=120');
  const contentRange = upstreamResponse.headers.get('content-range');
  if (contentRange) passthroughHeaders.set('Content-Range', contentRange);
  const acceptRanges = upstreamResponse.headers.get('accept-ranges');
  if (acceptRanges) passthroughHeaders.set('Accept-Ranges', acceptRanges);
  const contentLen = upstreamResponse.headers.get('content-length');
  if (contentLen) passthroughHeaders.set('Content-Length', contentLen);
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: withProxyCors(passthroughHeaders),
  });
}

export function bufferedResponse(
  buf: ArrayBuffer,
  upstreamResponse: Response,
  contentTypeRaw: string,
): Response {
  const fallbackHeaders = new Headers();
  fallbackHeaders.set('Content-Type', contentTypeRaw);
  fallbackHeaders.set('Cache-Control', 'private, max-age=120');
  const contentRange = upstreamResponse.headers.get('content-range');
  if (contentRange) fallbackHeaders.set('Content-Range', contentRange);
  const acceptRanges = upstreamResponse.headers.get('accept-ranges');
  if (acceptRanges) fallbackHeaders.set('Accept-Ranges', acceptRanges);
  const contentLen = upstreamResponse.headers.get('content-length');
  if (contentLen) fallbackHeaders.set('Content-Length', contentLen);

  return new Response(buf, {
    status: upstreamResponse.status,
    headers: withProxyCors(fallbackHeaders),
  });
}
