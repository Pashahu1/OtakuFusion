import { urlIsCrysolineHostedStream } from '@/lib/streamMediaType';
import { stripOriginFromHeaders } from '@/lib/streamProxyHeaders';

const M3U8_PROXY_PATH = '/api/m3u8-proxy';

export function readM3u8ProxyRelayBase(): string | null {
  const raw =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_M3U8_PROXY_BASE?.trim()
      : '';
  if (!raw) return null;
  return raw.replace(/\/$/, '');
}

function readM3u8ProxyPublicBase(): string | null {
  return readM3u8ProxyRelayBase();
}

function resolveM3u8ProxyOrigin(siteOrigin?: string): string {
  const relayBase = readM3u8ProxyPublicBase();
  if (relayBase) return relayBase;
  return (
    siteOrigin?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  );
}

export function buildM3u8ProxyPlaylistUrl(
  streamUrl: string,
  headers: Record<string, string>,
  siteOrigin?: string
): string {
  const origin = resolveM3u8ProxyOrigin(siteOrigin);
  const u = new URL(M3U8_PROXY_PATH, `${origin}/`);
  u.searchParams.set('url', streamUrl.trim());
  u.searchParams.set('headers', JSON.stringify(stripOriginFromHeaders(headers)));
  return u.toString();
}

export function buildM3u8ProxyRequestUrl(
  origin: string,
  streamUrl: string,
  headers: Record<string, string>,
): string {
  return buildM3u8ProxyPlaylistUrl(streamUrl, headers, origin);
}

/**
 * Final URL for Artplayer / hls.js — direct when Crysoline proxies or host allows CORS.
 */
export function resolveStreamPlaybackUrl(
  streamUrl: string,
  headers: Record<string, string>,
  isDirectHostUrl?: (url: string) => boolean,
  siteOrigin?: string
): string {
  const raw = streamUrl.trim();
  if (!raw) return raw;
  if (urlIsCrysolineHostedStream(raw)) return raw;
  if (isDirectHostUrl?.(raw)) return raw;
  return buildM3u8ProxyPlaylistUrl(raw, headers, siteOrigin);
}
