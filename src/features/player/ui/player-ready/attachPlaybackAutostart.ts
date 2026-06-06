import type Artplayer from 'artplayer';

import { pauseOrphanPlayerVideos } from '../hooks/artplayer-hls/hardStopPlayerMedia';

const MIN_BUFFER_AHEAD_SEC = 0.7;
const MAX_BUFFER_WAIT_MS = 2800;
const MIN_RESUME_SECONDS = 12;
const RESUME_GATE_FALLBACK_MS = 4500;

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

export interface AttachPlaybackAutostartOptions {
  /** Defer play until resume seek completes (Continue watching). */
  resumeTargetSeconds?: number;
}

export function attachPlaybackAutostart(
  art: Artplayer,
  userPausedRef: React.RefObject<boolean>,
  artRef: React.RefObject<HTMLDivElement | null>,
  options?: AttachPlaybackAutostartOptions,
): void {
  userPausedRef.current = false;
  let started = false;

  const resumeTarget = options?.resumeTargetSeconds;
  const needsResumeGate =
    resumeTarget != null &&
    Number.isFinite(resumeTarget) &&
    resumeTarget >= MIN_RESUME_SECONDS;
  let resumeGateOpen = !needsResumeGate;

  const openResumeGate = () => {
    if (resumeGateOpen) return;
    resumeGateOpen = true;
    tryPlay();
  };

  if (needsResumeGate) {
    art.once('video:seeked', openResumeGate);
    window.setTimeout(openResumeGate, RESUME_GATE_FALLBACK_MS);
  }

  const tryPlay = () => {
    if (!resumeGateOpen || started || userPausedRef.current) return;
    if (document.visibilityState !== 'visible') return;
    void attemptAutoplay(art).then((ok) => {
      if (ok) started = true;
    });
  };

  const bufferWaitStarted =
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  const tryPlayWhenBuffered = () => {
    if (!resumeGateOpen || started || userPausedRef.current) return;
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
