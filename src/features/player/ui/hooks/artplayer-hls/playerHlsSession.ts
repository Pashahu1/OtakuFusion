import type Hls from 'hls.js';

import { hardStopVideoElement } from './hardStopPlayerMedia';

interface PlayerHlsSession {
  hls: InstanceType<typeof Hls>;
  video: HTMLVideoElement;
}

let activeSession: PlayerHlsSession | null = null;

function teardownSession(session: PlayerHlsSession): void {
  try {
    session.hls.stopLoad();
    session.hls.detachMedia();
    session.hls.destroy();
  } catch {
    /* noop */
  }
  hardStopVideoElement(session.video);
}

/** Ensures at most one HLS playback session survives across player remounts / provider switches. */
export function replacePlayerHlsSession(
  hls: InstanceType<typeof Hls>,
  video: HTMLVideoElement,
): void {
  if (activeSession && activeSession.hls !== hls) {
    teardownSession(activeSession);
  }
  activeSession = { hls, video };
}

export function clearPlayerHlsSession(hls?: InstanceType<typeof Hls> | null): void {
  if (!activeSession) return;
  if (hls != null && activeSession.hls !== hls) return;
  teardownSession(activeSession);
  activeSession = null;
}

export function teardownActivePlayerHlsSession(): void {
  clearPlayerHlsSession();
}
