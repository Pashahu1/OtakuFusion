import type Artplayer from 'artplayer';
import Hls from 'hls.js';

import { isHardHttpFailure } from '../../playerPlaybackPreferences';

import type { ArtplayerHlsRuntimeContext } from './types';

export interface HlsRecoveryState {
  hlsRecoverNetworkTried: boolean;
  hlsMediaRecoveryStep: number;
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

function tryRecoverHlsError(
  hls: InstanceType<typeof Hls>,
  data: { type?: string; fatal?: boolean },
  recoveryState: HlsRecoveryState,
): boolean {
  if (!data.fatal) return false;

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
      (_evt: unknown, data: { fatal?: boolean; type?: string; response?: { code?: number } }) => {
        if (!ctx.effectActive()) return;

        logHlsErrorInDev(data as Parameters<typeof logHlsErrorInDev>[0]);

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
