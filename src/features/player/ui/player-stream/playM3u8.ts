/** Crysoline HLS: playlist compatibility often breaks on hls.js > 1.5.x — see pinned version in package.json. */
import Hls from 'hls.js';
import Artplayer from 'artplayer';

import {
  clearPlayerHlsSession,
  replacePlayerHlsSession,
} from '../hooks/artplayer-hls/playerHlsSession';

export interface PlayM3u8Hooks {
  /**
   * After `new Hls`, **before** `loadSource`: subscribe to `MANIFEST_PARSED`, lock level and call
   * `hls.startLoad()` (with `autoStartLoad: false` in config) — otherwise first fragments race with ABR.
   */
  onHlsBeforeLoad?: (hls: InstanceType<typeof Hls>) => void;
  /** Called synchronously after `art.hls = hls`. */
  onHlsInstance?: (hls: InstanceType<typeof Hls>) => void;
}

export function playM3u8(
  video: HTMLVideoElement,
  url: string,
  art: Artplayer,
  hooks?: PlayM3u8Hooks,
): void {
  video.crossOrigin = 'anonymous';

  if (Hls.isSupported()) {
    if (art.hls) {
      clearPlayerHlsSession(art.hls);
      art.hls.stopLoad();
      art.hls.detachMedia();
      art.hls.destroy();
      art.hls = null;
    }
    try {
      video.removeAttribute('src');
      video.load();
    } catch {
      /* noop */
    }
    const hls = new Hls({
      enableWorker: false,
      preferManagedMediaSource: false,
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
      maxBufferLength: 120,
      maxMaxBufferLength: 900,
      maxBufferSize: 256 * 1024 * 1024,
      maxBufferHole: 0.85,
      lowLatencyMode: false,
      autoStartLoad: false,
      startLevel: 0,
      startFragPrefetch: false,
      capLevelToPlayerSize: true,
      abrBandWidthUpFactor: 2.4,
      abrBandWidthFactor: 0.92,
      maxStarvationDelay: 12,
      maxLoadingDelay: 12,
      abrEwmaDefaultEstimate: 2_000_000,
      backBufferLength: 45,
      ...(typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
        ? {
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
    replacePlayerHlsSession(hls, video);
    hooks?.onHlsInstance?.(hls);
    art.on('destroy', () => {
      clearPlayerHlsSession(hls);
      hls.destroy();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'development'
  ) {
    console.warn('Unsupported playback format: m3u8');
  }
}
