import Hls from 'hls.js';
import Artplayer from 'artplayer';
import { M3U8_PROXY_URL, DEFAULT_REFERER } from './playerConstants';

interface StreamInfoForHeaders {
  streamingLink?: unknown;
}

export function getStreamHeaders(streamInfo: StreamInfoForHeaders | null): Record<string, string> {
  const headers: Record<string, string> = {};
  const streamLinkRaw = streamInfo?.streamingLink as { iframe?: string } | undefined;
  const iframeUrl =
    streamLinkRaw && !Array.isArray(streamLinkRaw) ? streamLinkRaw.iframe : undefined;

  if (iframeUrl) {
    try {
      const url = new URL(iframeUrl);
      headers.Referer = url.origin + '/';
    } catch {
      headers.Referer = DEFAULT_REFERER;
    }
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
    const hls = new Hls();
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
