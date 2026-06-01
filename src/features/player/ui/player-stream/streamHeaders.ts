import { decodeStreamUrlForInspection } from '@/lib/streamMediaType';
import {
  DEFAULT_REFERER,
  HLS_CDN_FALLBACK_ORIGIN,
  HLS_CDN_FALLBACK_REFERER,
} from '../playerConstants';

export interface StreamInfoForHeaders {
  streamingLink?: Array<{ iframe?: string; request_headers?: Record<string, string> }> | unknown;
  qualityVariants?: Array<{ url?: string; request_headers?: Record<string, string> }>;
}

function playlistSuggestsThirdPartyCdn(playlistUrl: string): boolean {
  const u = playlistUrl.toLowerCase();
  return (
    u.includes('.m3u8') &&
    (u.includes('nnr') ||
      u.includes('kwik') ||
      u.includes('crysoline') ||
      u.includes('crycloud') ||
      u.includes('lab.site') ||
      u.includes('rapid') ||
      u.includes('mcloud') ||
      u.includes('megacdn') ||
      u.includes('code29wave') ||
      u.includes('megaup') ||
      u.includes('owocdn') ||
      u.includes('libria.fun'))
  );
}

function pickStreamingLinkForPlaylist(
  streamInfo: StreamInfoForHeaders | null,
  playlistUrl?: string | null,
):
  | { iframe?: string; request_headers?: Record<string, string> }
  | undefined {
  const streamLinkRaw = streamInfo?.streamingLink as
    | { iframe?: string; request_headers?: Record<string, string>; link?: { file?: string } }
    | Array<{
        iframe?: string;
        request_headers?: Record<string, string>;
        link?: { file?: string };
      }>
    | undefined;
  if (!streamLinkRaw) return undefined;
  if (!Array.isArray(streamLinkRaw)) return streamLinkRaw;
  const p = playlistUrl?.trim();
  if (p) {
    const hit = streamLinkRaw.find(
      (item) => item && typeof item === 'object' && item.link?.file?.trim() === p,
    );
    if (hit) return hit;
  }
  return streamLinkRaw.find((item) => item && typeof item === 'object');
}

/** Headers for M3U8 proxy: `request_headers` from API, otherwise Referer for embed CDN. */
export function getStreamHeaders(
  streamInfo: StreamInfoForHeaders | null,
  playlistUrl?: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {};
  const p = playlistUrl?.trim();
  const variants = streamInfo?.qualityVariants;
  if (p && Array.isArray(variants)) {
    const hit = variants.find(
      (v) =>
        v &&
        typeof v === 'object' &&
        typeof v.url === 'string' &&
        v.url.trim() === p,
    );
    const vr = hit?.request_headers;
    if (vr && typeof vr === 'object' && !Array.isArray(vr)) {
      for (const [key, value] of Object.entries(vr)) {
        if (typeof key !== 'string' || !key.trim()) continue;
        if (typeof value !== 'string' || !value.trim()) continue;
        headers[key] = value;
      }
      if (Object.keys(headers).length > 0) return headers;
    }
  }
  const firstLink = pickStreamingLinkForPlaylist(streamInfo, playlistUrl);
  const requestHeaders = firstLink?.request_headers;
  if (requestHeaders && typeof requestHeaders === 'object') {
    for (const [key, value] of Object.entries(requestHeaders)) {
      if (typeof key !== 'string' || !key.trim()) continue;
      if (typeof value !== 'string' || !value.trim()) continue;
      headers[key] = value;
    }
    if (Object.keys(headers).length > 0) return headers;
  }
  const iframeUrl = firstLink?.iframe;

  if (iframeUrl) {
    try {
      const url = new URL(iframeUrl);
      const origin = url.origin;
      headers.Referer = `${origin}/`;
      headers.Origin = origin;
    } catch {
      headers.Referer = DEFAULT_REFERER;
    }
  } else if (
    typeof playlistUrl === 'string' &&
    playlistUrl.trim() &&
    (playlistSuggestsThirdPartyCdn(playlistUrl) ||
      decodeStreamUrlForInspection(playlistUrl).includes('24stream'))
  ) {
    headers.Referer = HLS_CDN_FALLBACK_REFERER;
    headers.Origin = HLS_CDN_FALLBACK_ORIGIN;
  } else {
    headers.Referer = DEFAULT_REFERER;
  }

  return headers;
}
