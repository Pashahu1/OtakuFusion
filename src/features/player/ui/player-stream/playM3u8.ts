/** HLS playlist compatibility often breaks on hls.js > 1.5.x — see pinned version in package.json. */
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
      manifestLoadingMaxRetry: 3,
      levelLoadingMaxRetry: 4,
      fragLoadingMaxRetry: 8,
      fragLoadingMaxRetryTimeout: 120000,
      manifestLoadingRetryDelay: 800,
      levelLoadingRetryDelay: 1000,
      fragLoadingRetryDelay: 2000,
      manifestLoadingTimeOut: 12000,
      levelLoadingTimeOut: 10000,
      fragLoadingTimeOut: 45000,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 80 * 1024 * 1024,
      maxBufferHole: 0.85,
      lowLatencyMode: false,
      autoStartLoad: false,
      startLevel: -1,
      startFragPrefetch: true,
      capLevelToPlayerSize: false,
      abrBandWidthUpFactor: 0.8,
      abrBandWidthFactor: 0.95,
      maxStarvationDelay: 8,
      maxLoadingDelay: 8,
      abrEwmaDefaultEstimate: 12_000_000,
      backBufferLength: 30,
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
