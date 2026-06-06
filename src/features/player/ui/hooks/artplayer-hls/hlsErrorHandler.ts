import type Artplayer from 'artplayer';
import Hls from 'hls.js';

import { isHardHttpFailure } from '../../playerPlaybackPreferences';
import { tryDowngradeHlsQualityLevel } from '../../playback-preferences/hlsQualityFallback';

import type { ArtplayerHlsRuntimeContext } from './types';

export interface HlsRecoveryState {
  hlsRecoverNetworkTried: boolean;
  hlsMediaRecoveryStep: number;
  hlsQualityDowngrades: number;
}

function logHlsErrorInDev(data: {
  fatal?: boolean;
  type?: string;
  response?: { code?: number };
  details?: unknown;
  reason?: unknown;
}) {
  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'development') return;

  const http = data.response?.code;
  const payload: Record<string, unknown> = {
    type: data.type,
    fatal: data.fatal,
    details: data.details,
  };
  if (http != null) payload.http = http;
  if (data.reason != null && data.reason !== '') payload.reason = data.reason;

  const detailsStr = String(data.details ?? '');
  const isNoisyMseDetails =
    detailsStr === 'bufferAddCodecError' || detailsStr === 'bufferAppendError';
  const log =
    data.type === Hls.ErrorTypes.MEDIA_ERROR && isNoisyMseDetails
      ? console.debug
      : console.warn;
  log('[OtakuFusion][Hls]', payload);
}

function isLevelLoadHttpFailure(data: {
  type?: string;
  details?: string;
  response?: { code?: number };
}): boolean {
  if (data.type !== Hls.ErrorTypes.NETWORK_ERROR) return false;
  if (
    data.details !== Hls.ErrorDetails.LEVEL_LOAD_ERROR &&
    data.details !== Hls.ErrorDetails.FRAG_LOAD_ERROR
  ) {
    return false;
  }
  const http = data.response?.code;
  return typeof http === 'number' && http >= 400;
}

/** CDN often returns 522/502 only for broken renditions — step down before hls.js exhausts retries. */
function tryDowngradeOnLevelHttpFailure(
  hls: InstanceType<typeof Hls>,
  data: { type?: string; details?: string; response?: { code?: number } },
  recoveryState: HlsRecoveryState,
): boolean {
  if (!isLevelLoadHttpFailure(data)) return false;
  if (recoveryState.hlsQualityDowngrades >= 4) return false;
  if (!tryDowngradeHlsQualityLevel(hls)) return false;
  recoveryState.hlsQualityDowngrades += 1;
  return true;
}

function tryRecoverHlsError(
  hls: InstanceType<typeof Hls>,
  data: { type?: string; fatal?: boolean; details?: string },
  recoveryState: HlsRecoveryState,
): boolean {
  if (!data.fatal) return false;

  const isLevelLoadFailure =
    data.type === Hls.ErrorTypes.NETWORK_ERROR &&
    (data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
      data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR);

  if (
    isLevelLoadFailure &&
    recoveryState.hlsQualityDowngrades < 4 &&
    tryDowngradeHlsQualityLevel(hls)
  ) {
    recoveryState.hlsQualityDowngrades += 1;
    return true;
  }

  if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !recoveryState.hlsRecoverNetworkTried) {
    recoveryState.hlsRecoverNetworkTried = true;
    try {
      hls.startLoad();
      return true;
    } catch {
      return false;
    }
  }

  if (data.type === Hls.ErrorTypes.MEDIA_ERROR && recoveryState.hlsMediaRecoveryStep < 2) {
    recoveryState.hlsMediaRecoveryStep += 1;
    try {
      if (recoveryState.hlsMediaRecoveryStep === 1) {
        hls.recoverMediaError();
      } else {
        hls.swapAudioCodec();
        hls.recoverMediaError();
      }
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function bindM3u8HlsInstanceHandler(
  ctx: ArtplayerHlsRuntimeContext,
  reportError: (art: Artplayer) => void,
  recoveryState: HlsRecoveryState,
) {
  return (hls: InstanceType<typeof Hls>, art: Artplayer) => {
    hls.on(
      Hls.Events.ERROR,
      (_evt: unknown, data: { fatal?: boolean; type?: string; response?: { code?: number }; details?: string }) => {
        if (!ctx.effectActive()) return;

        logHlsErrorInDev(data as Parameters<typeof logHlsErrorInDev>[0]);

        if (tryDowngradeOnLevelHttpFailure(hls, data, recoveryState)) return;

        const isManifestLoadFailure =
          data?.type === Hls.ErrorTypes.NETWORK_ERROR &&
          data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR;
        const manifestHttp =
          typeof data.response?.code === 'number' ? data.response.code : null;
        if (
          isManifestLoadFailure &&
          manifestHttp != null &&
          manifestHttp >= 500 &&
          !recoveryState.hlsRecoverNetworkTried
        ) {
          recoveryState.hlsRecoverNetworkTried = true;
          try {
            hls.startLoad(-1);
            return;
          } catch {
            /* fall through */
          }
        }

        if (data?.type === Hls.ErrorTypes.NETWORK_ERROR && isHardHttpFailure(data)) {
          reportError(art);
          return;
        }

        if (tryRecoverHlsError(hls, data, recoveryState)) return;

        if (data?.fatal) {
          reportError(art);
        }
      },
    );
  };
}
