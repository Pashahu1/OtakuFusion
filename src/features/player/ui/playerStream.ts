/** Crysoline HLS: playlist compatibility often breaks on hls.js > 1.5.x — see pinned version in package.json. */
import Hls from 'hls.js';
import Artplayer from 'artplayer';
import { resolveStreamPlaybackUrl } from '@/lib/m3u8ProxyPublicBase';
import { decodeStreamUrlForInspection } from '@/lib/streamMediaType';
import {
  DEFAULT_REFERER,
  HLS_CDN_FALLBACK_ORIGIN,
  HLS_CDN_FALLBACK_REFERER,
  ANIKAI_PAGE_REFERER,
} from './playerConstants';

interface StreamInfoForHeaders {
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
  playlistUrl?: string | null
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
      (item) => item && typeof item === 'object' && item.link?.file?.trim() === p
    );
    if (hit) return hit;
  }
  return streamLinkRaw.find((item) => item && typeof item === 'object');
}

/**
 * Headers for M3U8 proxy: `request_headers` from API, otherwise Referer for embed CDN.
 */
export function getStreamHeaders(
  streamInfo: StreamInfoForHeaders | null,
  playlistUrl?: string | null
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
        v.url.trim() === p
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

/** HLS hosts safer to fetch directly from the client (not via /api/m3u8-proxy) — otherwise each segment hits Vercel Fast Origin Transfer. */
const HLS_DIRECT_HOST_SUFFIXES_BUILTIN = [] as const;

function readHlsDirectHostSuffixes(): string[] {
  const raw =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_HLS_DIRECT_HOST_SUFFIXES?.trim()
      : '';
  const fromEnv = raw
    ? raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of [...HLS_DIRECT_HOST_SUFFIXES_BUILTIN, ...fromEnv]) {
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function hostMatchesHlsDirectSuffix(hostname: string, suffixes: string[]): boolean {
  for (const suf of suffixes) {
    if (!suf) continue;
    if (hostname === suf) return true;
    if (suf.startsWith('.') && hostname.endsWith(suf)) return true;
    if (hostname.endsWith(`.${suf}`)) return true;
  }
  return false;
}

/** Direct browser fetch (CORS allowed) — main playlist, subtitles, preview. */
export function isHlsDirectHostUrl(streamUrl: string): boolean {
  const raw = streamUrl.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) return false;
  const suffixes = readHlsDirectHostSuffixes();
  if (!suffixes.length) return false;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    return hostMatchesHlsDirectSuffix(host, suffixes);
  } catch {
    return false;
  }
}

export function getStreamFullUrl(
  streamUrl: string,
  headers: Record<string, string>
): string {
  return resolveStreamPlaybackUrl(streamUrl, headers, isHlsDirectHostUrl);
}

/** Subtitles, VTT thumbnails — same proxy/direct rules as main stream. */
export function resolveAssetPlaybackUrl(
  url: string,
  requestHeaders?: Record<string, string>
): string {
  const raw = url.trim();
  if (!raw) return raw;
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return raw;
  if (!/^https?:\/\//i.test(raw)) return raw;
  const headerPayload =
    requestHeaders && Object.keys(requestHeaders).length > 0
      ? requestHeaders
      : {
          Referer: ANIKAI_PAGE_REFERER,
          Origin: 'https://anikai.to',
        };
  return resolveStreamPlaybackUrl(raw, headerPayload, isHlsDirectHostUrl);
}

export interface PlayM3u8Hooks {
  /**
   * After `new Hls`, **before** `loadSource`: subscribe to `MANIFEST_PARSED`, lock level and call
   * `hls.startLoad()` (with `autoStartLoad: false` in config) — otherwise first fragments race with ABR.
   */
  onHlsBeforeLoad?: (hls: InstanceType<typeof Hls>) => void;
  /** Called synchronously after `art.hls = hls` (Artplayer sets url async — externally `art.hls` may still be `null` right after `new Artplayer`). */
  onHlsInstance?: (hls: InstanceType<typeof Hls>) => void;
}

export function playM3u8(
  video: HTMLVideoElement,
  url: string,
  art: Artplayer,
  hooks?: PlayM3u8Hooks
): void {
  if (Hls.isSupported()) {
    if (art.hls) art.hls.destroy();
    // VoD: stable buffer on flaky/proxy origins.
    // `autoStartLoad: false` + `startLoad()` in `MANIFEST_PARSED` (see onHlsBeforeLoad): otherwise ABR
    // sometimes requests the wrong level before lock — bufferAddCodec / bufferAppend on owocdn.
    const hls = new Hls({
      /**
       * On Chromium `enableWorker: true` sometimes causes `bufferAddCodecError` / `bufferAppendError` on some
       * CDNs (owocdn / ".jpg" segments) — transmux on main thread is more reliable.
       */
      enableWorker: false,
      /**
       * `true` on some Chromium builds causes `bufferAddCodecError` / `bufferAppendError` on HLS (owocdn / fMP4).
       * Classic MediaSource is more stable for this pipeline.
       */
      preferManagedMediaSource: false,
      /**
       * Via our m3u8 proxy segments are often slower: few retries + short timeout
       * cause "gray bar frozen right after playhead" — hls.js stops loading ahead.
       * Retries capped so hard 4xx does not loop thousands of XHR (fallback stays in React).
       */
      manifestLoadingMaxRetry: 2,
      levelLoadingMaxRetry: 3,
      fragLoadingMaxRetry: 5,
      fragLoadingMaxRetryTimeout: 120000,
      manifestLoadingRetryDelay: 400,
      levelLoadingRetryDelay: 400,
      fragLoadingRetryDelay: 400,
      manifestLoadingTimeOut: 15000,
      levelLoadingTimeOut: 28000,
      fragLoadingTimeOut: 45000,
      /**
       * VoD: target seconds ahead of playhead. With maxBufferSize sets how far
       * we buffer (roughly tens of seconds — a few minutes depending on bitrate).
       */
      maxBufferLength: 120,
      maxMaxBufferLength: 900,
      /**
       * Hard buffer cap in bytes: at 1080p often hits before maxBufferLength.
       */
      maxBufferSize: 256 * 1024 * 1024,
      /** Allow small gaps between segments to reduce stalls without appends. */
      maxBufferHole: 0.85,
      lowLatencyMode: false,
      /**
       * Always false: single start in `MANIFEST_PARSED` (`onM3u8HlsBeforeLoad`) — otherwise on Anikage/24stream
       * ABR picks the wrong level before lock (bufferAddCodec / black screen).
       */
      autoStartLoad: false,
      /** Start at lowest rung; actual level replaced immediately in `MANIFEST_PARSED`. */
      startLevel: 0,
      /** false: prefetching another level during ABR sometimes mixes init segments → append/codec errors on owocdn. */
      startFragPrefetch: false,
      /** Do not raise level above video size — fewer codec jumps on narrow viewport. */
      capLevelToPlayerSize: true,
      /** Slower quality ramp after start — more stable MSE on third-party CDNs. */
      abrBandWidthUpFactor: 2.4,
      abrBandWidthFactor: 0.92,
      maxStarvationDelay: 12,
      maxLoadingDelay: 12,
      /**
       * Initial bitrate estimate (bps). Kept below 1080p so before player cap applies
       * the top level is less often picked right after manifest parse.
       */
      abrEwmaDefaultEstimate: 2_000_000,
      /** Less behind playhead — slightly more budget for forward fragments on weak devices. */
      backBufferLength: 45,
      ...(typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
        ? {
            /**
             * Chrome DevTools often shows "200 (disk cache)" for `/api/m3u8-proxy` — stale playlist
             * with expired tokens causes fatal Hls errors after our ERROR subscription fix.
             */
            xhrSetup(xhr: XMLHttpRequest, url: string) {
              if (url.includes('/api/m3u8-proxy')) {
                try {
                  xhr.setRequestHeader('Cache-Control', 'no-cache');
                  xhr.setRequestHeader('Pragma', 'no-cache');
                } catch {
                  /* ignore */
                }
              }
            },
          }
        : {}),
    });
    hooks?.onHlsBeforeLoad?.(hls);
    hls.loadSource(url);
    hls.attachMedia(video);
    art.hls = hls;
    hooks?.onHlsInstance?.(hls);
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
