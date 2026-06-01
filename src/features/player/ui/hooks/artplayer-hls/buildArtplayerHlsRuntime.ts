import type Artplayer from 'artplayer';
import HlsJs from 'hls.js';

import { playM3u8 } from '../../playerStream';

import { attachHlsQualityPersistenceOnReady } from './attachHlsQualityPersistenceOnReady';
import { bindM3u8HlsInstanceHandler } from './hlsErrorHandler';
import { createHlsBeforeLoadHandler, teardownArtplayerHls } from './hlsBeforeLoadHandler';
import { resetArtplayerProgressHoverUi } from './resetArtplayerProgressHoverUi';
import type { ArtplayerHlsRuntime, ArtplayerHlsRuntimeContext } from './types';

export function buildArtplayerHlsRuntime(
  ctx: ArtplayerHlsRuntimeContext,
): ArtplayerHlsRuntime {
  let hasReportedError = false;
  const recoveryState = {
    hlsRecoverNetworkTried: false,
    hlsMediaRecoveryStep: 0,
  };

  const onM3u8HlsBeforeLoad = createHlsBeforeLoadHandler();

  const reportError = (art: Artplayer) => {
    if (!ctx.effectActive() || ctx.suppressPlaybackError() || hasReportedError) return;
    hasReportedError = true;
    resetArtplayerProgressHoverUi(art);
    teardownArtplayerHls(art);
    ctx.onPlaybackError();
  };

  const onM3u8HlsInstance = bindM3u8HlsInstanceHandler(ctx, reportError, recoveryState);

  const bootHlsPlayback = (art: Artplayer, fullURL: string) => {
    if (!ctx.effectActive()) return;
    if (!HlsJs.isSupported()) {
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
    attachHlsQualityPersistenceOnReady(art, ctx.useManualStreamQuality);
  };

  return {
    onM3u8HlsInstance,
    onM3u8HlsBeforeLoad,
    bootHlsPlayback,
    attachQualityPersistenceOnReady,
    reportFatalPlaybackError: reportError,
  };
}

export type { ArtplayerHlsRuntime, ArtplayerHlsRuntimeContext } from './types';
