import Artplayer from 'artplayer';
import Hls from 'hls.js';

import { urlLooksLikeHlsStream, inferStreamMediaKind } from '@/lib/streamMediaType';
import { playM3u8 } from '../playerStream';
import {
  attachHlsQualityPreferencePersistence,
  isHardHttpFailure,
  readHlsQualityPreference,
  resolveLevelIndexForStoredQuality,
} from '../playerPlaybackPreferences';
import type { PlayerProps } from '@/shared/types/PlayerTypes';
import { clearArtplayerSubtitleResizeRaf } from './useArtplayerSubtitleResize';

export function inferArtplayerMediaType(
  streamUrl: string,
  streamInfo: PlayerProps['streamInfo'],
  proxiedUrl: string
): 'm3u8' | 'mp4' {
  if (urlLooksLikeHlsStream(streamUrl) || urlLooksLikeHlsStream(proxiedUrl)) {
    return 'm3u8';
  }
  const linkRaw = streamInfo?.streamingLink;
  const first = Array.isArray(linkRaw) ? linkRaw[0] : linkRaw;
  const mediaType =
    first && typeof first === 'object' && first.link?.type
      ? String(first.link.type).toLowerCase()
      : '';
  if (mediaType === 'mp4') return 'mp4';
  if (mediaType === 'hls' || mediaType === 'm3u8') return 'm3u8';
  return inferStreamMediaKind(streamUrl) === 'mp4' ? 'mp4' : 'm3u8';
}

/** Після зриву HLS `art.duration` скидається, а текст у `.art-progress-tip` може лишатися — прибираємо «спалах» тривалості. */
export function resetArtplayerProgressHoverUi(art: Artplayer) {
  try {
    const $player = art.template?.$player;
    if (!$player) return;
    $player.classList.remove('art-progress-hover');
    const tip = $player.querySelector('.art-progress-tip');
    if (tip) tip.textContent = '00:00';
  } catch {
    /* noop */
  }
}

/** У dev за замовчуванням відкладаємо створення Hls на наступний macrotask — обхід подвійного mount Strict Mode. */
export function readPlayerDeferStrictInit(): boolean {
  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'development') {
    return false;
  }
  const raw = process.env.NEXT_PUBLIC_PLAYER_DEFER_STRICT_INIT?.trim().toLowerCase();
  if (raw === '0' || raw === 'false') return false;
  return true;
}

export interface ArtplayerHlsRuntimeContext {
  effectActive: () => boolean;
  suppressPlaybackError: () => boolean;
  onPlaybackError: () => void;
  useManualStreamQuality: boolean;
}

export interface ArtplayerHlsRuntime {
  onM3u8HlsInstance: (hls: InstanceType<typeof Hls>, art: Artplayer) => void;
  onM3u8HlsBeforeLoad: (hls: InstanceType<typeof Hls>) => void;
  bootHlsPlayback: (art: Artplayer, fullURL: string) => void;
  attachQualityPersistenceOnReady: (art: Artplayer) => void;
  reportFatalPlaybackError: (art: Artplayer) => void;
}

export function buildArtplayerHlsRuntime(
  ctx: ArtplayerHlsRuntimeContext
): ArtplayerHlsRuntime {
  let hasReportedError = false;
  let hlsRecoverNetworkTried = false;
  /** 0 = ще не пробували; 1 = recoverMediaError; 2 = swapAudioCodec + recoverMediaError */
  let hlsMediaRecoveryStep = 0;

  const reportError = (art: Artplayer) => {
    if (!ctx.effectActive() || ctx.suppressPlaybackError() || hasReportedError) return;
    hasReportedError = true;
    resetArtplayerProgressHoverUi(art);
    try {
      if (art.hls) {
        art.hls.stopLoad();
        art.hls.destroy();
        art.hls = null;
      }
    } catch {
      /* noop */
    }
    ctx.onPlaybackError();
  };

  const onM3u8HlsInstance = (hls: InstanceType<typeof Hls>, art: Artplayer) => {
    hls.on(
      Hls.Events.ERROR,
      (_evt: unknown, data: { fatal?: boolean; type?: string; response?: { code?: number } }) => {
        if (!ctx.effectActive()) return;
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
          const d = data as { details?: unknown; reason?: unknown; fatal?: unknown };
          const http = (data as { response?: { code?: number } }).response?.code;
          const payload: Record<string, unknown> = {
            type: data?.type,
            fatal: data?.fatal,
            details: d.details,
          };
          if (http != null) payload.http = http;
          if (d.reason != null && d.reason !== '') payload.reason = d.reason;
          const detailsStr = String(d.details ?? '');
          const isNoisyMseDetails =
            detailsStr === 'bufferAddCodecError' || detailsStr === 'bufferAppendError';
          const log =
            data?.type === Hls.ErrorTypes.MEDIA_ERROR && isNoisyMseDetails
              ? console.debug
              : console.warn;
          log('[OtakuFusion][Hls]', payload);
        }
        if (data?.type === Hls.ErrorTypes.NETWORK_ERROR && isHardHttpFailure(data)) {
          reportError(art);
          return;
        }
        if (data?.fatal && hls) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !hlsRecoverNetworkTried) {
            hlsRecoverNetworkTried = true;
            try {
              hls.startLoad();
              return;
            } catch {
              /* fall through to reportError */
            }
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && hlsMediaRecoveryStep < 2) {
            hlsMediaRecoveryStep += 1;
            try {
              if (hlsMediaRecoveryStep === 1) {
                hls.recoverMediaError();
              } else {
                hls.swapAudioCodec();
                hls.recoverMediaError();
              }
              return;
            } catch {
              /* fall through */
            }
          }
          reportError(art);
        }
      }
    );
  };

  const onM3u8HlsBeforeLoad = (hls: InstanceType<typeof Hls>) => {
    const storedQualitySnapshot = readHlsQualityPreference();
    const applyInitialLevelOnce = () => {
      hls.off(Hls.Events.MANIFEST_PARSED, applyInitialLevelOnce);
      try {
        if (!hls.levels?.length) {
          hls.loadLevel = -1;
          return;
        }
        const idx = resolveLevelIndexForStoredQuality(
          hls.levels as Array<{ height?: number; bitrate?: number }>,
          storedQualitySnapshot
        );
        if (idx < 0) {
          hls.currentLevel = 0;
          hls.nextLevel = 0;
          hls.loadLevel = 0;
        } else {
          hls.currentLevel = idx;
          hls.nextLevel = idx;
          hls.loadLevel = idx;
        }
      } finally {
        try {
          hls.startLoad();
        } catch {
          /* noop */
        }
      }
    };
    hls.on(Hls.Events.MANIFEST_PARSED, applyInitialLevelOnce);
  };

  const bootHlsPlayback = (art: Artplayer, fullURL: string) => {
    if (!ctx.effectActive()) return;
    if (!Hls.isSupported()) {
      reportError(art);
      return;
    }
    try {
      if (art.video) {
        art.video.removeAttribute('src');
        art.video.load();
      }
    } catch {
      /* noop */
    }
    playM3u8(art.video, fullURL, art, {
      onHlsBeforeLoad: onM3u8HlsBeforeLoad,
      onHlsInstance: (hls) => onM3u8HlsInstance(hls, art),
    });
  };

  const attachQualityPersistenceOnReady = (art: Artplayer) => {
    if (ctx.useManualStreamQuality) return;

    const storedQualitySnapshot = readHlsQualityPreference();
    const plugins = art.plugins as unknown as {
      artplayerPluginHlsControl?: { update?: () => void };
    };
    const syncHlsQualityUi = () => {
      plugins.artplayerPluginHlsControl?.update?.();
    };
    const hlsInstance = art.hls;

    if (!hlsInstance) return;

    let detachQualityPersist: (() => void) | null = null;
    const onDestroyHlsUi = () => {
      hlsInstance.off(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
      hlsInstance.off(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
      detachQualityPersist?.();
      detachQualityPersist = null;
    };

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, syncHlsQualityUi);
    hlsInstance.on(Hls.Events.LEVEL_SWITCHED, syncHlsQualityUi);
    syncHlsQualityUi();
    detachQualityPersist = attachHlsQualityPreferencePersistence(
      hlsInstance,
      syncHlsQualityUi,
      {
        muteInitialPersistenceMs:
          storedQualitySnapshot === null ||
          storedQualitySnapshot === 'best-display' ||
          storedQualitySnapshot === 'auto'
            ? 2200
            : 0,
      }
    );
    art.on('destroy', onDestroyHlsUi);
  };

  return {
    onM3u8HlsInstance,
    onM3u8HlsBeforeLoad,
    bootHlsPlayback,
    attachQualityPersistenceOnReady,
    reportFatalPlaybackError: reportError,
  };
}

export function createArtplayerVideoErrorReporter(
  art: Artplayer,
  ctx: { effectActive: () => boolean; suppressPlaybackError: () => boolean; reportError: () => void }
) {
  art.on('video:error', () => {
    if (!ctx.effectActive() || ctx.suppressPlaybackError()) return;
    const code = art.video?.error?.code;
    if (code === MediaError.MEDIA_ERR_ABORTED) return;
    ctx.reportError();
  });
}

export function destroyArtplayerInstance(
  instance: Artplayer,
  container: HTMLDivElement | null
) {
  try {
    clearArtplayerSubtitleResizeRaf(instance);
    if (instance.hls) {
      instance.hls.destroy();
      instance.hls = null;
    }
    if (instance.video) {
      instance.video.pause();
      instance.video.removeAttribute('src');
      instance.video.load();
    }
    instance.pause();
    instance.destroy(false);
  } catch (e) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('Player cleanup:', e);
    }
  }
  if (container && typeof container.innerHTML !== 'undefined') {
    container.innerHTML = '';
  }
}
