import type Artplayer from 'artplayer';

import { clearArtplayerSubtitleResizeRaf } from '../useArtplayerSubtitleResize';
import { hardStopArtplayerMedia } from './hardStopPlayerMedia';
import { teardownActivePlayerHlsSession } from './playerHlsSession';

/** In dev, defer Hls creation to next macrotask by default — workaround for Strict Mode double mount. */
export function readPlayerDeferStrictInit(): boolean {
  if (typeof process === 'undefined' || process.env.NODE_ENV !== 'development') {
    return false;
  }
  const raw = process.env.NEXT_PUBLIC_PLAYER_DEFER_STRICT_INIT?.trim().toLowerCase();
  if (raw === '0' || raw === 'false') return false;
  return true;
}

export function createArtplayerVideoErrorReporter(
  art: Artplayer,
  ctx: { effectActive: () => boolean; suppressPlaybackError: () => boolean; reportError: () => void },
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
  container: HTMLDivElement | null,
) {
  try {
    clearArtplayerSubtitleResizeRaf(instance);
    hardStopArtplayerMedia(instance, container);
    teardownActivePlayerHlsSession();
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
