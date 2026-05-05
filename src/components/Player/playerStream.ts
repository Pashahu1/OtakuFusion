import Hls from 'hls.js';
import Artplayer from 'artplayer';
import {
  M3U8_PROXY_URL,
  DEFAULT_REFERER,
  ANIKAI_PAGE_REFERER,
} from './playerConstants';

interface StreamInfoForHeaders {
  streamingLink?: Array<{ iframe?: string; request_headers?: Record<string, string> }> | unknown;
}

function playlistSuggestsThirdPartyCdn(playlistUrl: string): boolean {
  const u = playlistUrl.toLowerCase();
  return (
    u.includes('.m3u8') &&
    (u.includes('nnr') ||
      u.includes('anikai') ||
      u.includes('lab.site') ||
      u.includes('rapid') ||
      u.includes('mcloud') ||
      u.includes('megacdn') ||
      u.includes('code29wave') ||
      u.includes('megaup'))
  );
}

/**
 * Заголовки для M3U8-проксі: embed з API, інакше Referer під сторінку AniKai для сторонніх CDN.
 */
export function getStreamHeaders(
  streamInfo: StreamInfoForHeaders | null,
  playlistUrl?: string | null
): Record<string, string> {
  const headers: Record<string, string> = {};
  const streamLinkRaw = streamInfo?.streamingLink as
    | { iframe?: string; request_headers?: Record<string, string> }
    | Array<{ iframe?: string; request_headers?: Record<string, string> }>
    | undefined;
  const firstLink = Array.isArray(streamLinkRaw)
    ? streamLinkRaw.find((item) => item && typeof item === 'object')
    : streamLinkRaw;
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
    playlistSuggestsThirdPartyCdn(playlistUrl)
  ) {
    headers.Referer = ANIKAI_PAGE_REFERER;
    headers.Origin = 'https://anikai.to';
  } else {
    headers.Referer = DEFAULT_REFERER;
  }

  return headers;
}

export function getStreamFullUrl(
  streamUrl: string,
  headers: Record<string, string>
): string {
  if (!M3U8_PROXY_URL) return streamUrl;
  return (
    M3U8_PROXY_URL +
    encodeURIComponent(streamUrl) +
    '&headers=' +
    encodeURIComponent(JSON.stringify(headers))
  );
}

export function playM3u8(
  video: HTMLVideoElement,
  url: string,
  art: Artplayer
): void {
  if (Hls.isSupported()) {
    if (art.hls) art.hls.destroy();
    const hls = new Hls({
      /**
       * Обмежуємо ретраї, щоб при 4xx не було сотень/тисяч XHR.
       * Далі перемикання на інший стрім обробляє наш fallback у React.
       */
      manifestLoadingMaxRetry: 1,
      levelLoadingMaxRetry: 1,
      fragLoadingMaxRetry: 1,
      manifestLoadingRetryDelay: 300,
      levelLoadingRetryDelay: 300,
      fragLoadingRetryDelay: 300,
      manifestLoadingTimeOut: 10000,
      levelLoadingTimeOut: 10000,
      fragLoadingTimeOut: 15000,
    });
    hls.loadSource(url);
    hls.attachMedia(video);
    art.hls = hls;
    art.on('destroy', () => hls.destroy());
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'development'
  ) {
    console.warn('Unsupported playback format: m3u8');
  }
}
