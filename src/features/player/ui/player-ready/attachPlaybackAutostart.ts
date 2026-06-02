import type Artplayer from 'artplayer';

import { pauseOrphanPlayerVideos } from '../hooks/artplayer-hls/hardStopPlayerMedia';

const MIN_BUFFER_AHEAD_SEC = 0.7;
const MAX_BUFFER_WAIT_MS = 2800;

async function attemptAutoplay(art: Artplayer): Promise<boolean> {
  try {
    await art.play();
    return true;
  } catch {
    try {
      const wasMuted = art.muted;
      art.muted = true;
      await art.play();
      if (!wasMuted) {
        art.muted = false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

export function attachPlaybackAutostart(
  art: Artplayer,
  userPausedRef: React.RefObject<boolean>,
  artRef: React.RefObject<HTMLDivElement | null>,
): void {
  userPausedRef.current = false;
  let started = false;

  const tryPlay = () => {
    if (started || userPausedRef.current) return;
    if (document.visibilityState !== 'visible') return;
    void attemptAutoplay(art).then((ok) => {
      if (ok) started = true;
    });
  };

  const bufferWaitStarted =
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  const tryPlayWhenBuffered = () => {
    if (started || userPausedRef.current) return;
    const v = art.video;
    if (!v) {
      tryPlay();
      return;
    }
    let ahead = 0;
    try {
      const buf = v.buffered;
      if (buf.length > 0) {
        ahead = buf.end(buf.length - 1) - v.currentTime;
      }
    } catch {
    }
    const elapsed =
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
      bufferWaitStarted;
    if (ahead >= MIN_BUFFER_AHEAD_SEC || elapsed >= MAX_BUFFER_WAIT_MS) {
      tryPlay();
      return;
    }
    requestAnimationFrame(tryPlayWhenBuffered);
  };

  art.once('video:canplay', tryPlayWhenBuffered);
  art.once('video:loadeddata', tryPlayWhenBuffered);

  art.on('pause', () => {
    userPausedRef.current = true;
    pauseOrphanPlayerVideos(art, [artRef.current]);
  });

  art.on('play', () => {
    userPausedRef.current = false;
    started = true;
  });
}
