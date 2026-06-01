import type Artplayer from 'artplayer';

const MIN_BUFFER_AHEAD_SEC = 0.7;
const MAX_BUFFER_WAIT_MS = 2800;

export function attachPlaybackAutostart(
  art: Artplayer,
  userPausedRef: React.RefObject<boolean>,
  artRef: React.RefObject<HTMLDivElement | null>
): void {
  const tryPlay = () => {
    if (userPausedRef.current) return;
    if (document.visibilityState === 'visible') art.play().catch(() => {});
  };

  const bufferWaitStarted =
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  const tryPlayWhenBuffered = () => {
    if (userPausedRef.current) return;
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
      /* noop */
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

  art.on('pause', () => {
    userPausedRef.current = true;
    art.video?.pause();
    artRef.current?.querySelectorAll('video, audio').forEach((el) => {
      (el as HTMLMediaElement).pause();
    });
  });

  art.on('play', () => {
    userPausedRef.current = false;
  });
}
