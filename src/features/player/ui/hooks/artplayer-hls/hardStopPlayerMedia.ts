import type Artplayer from 'artplayer';

import { clearPlayerHlsSession, teardownActivePlayerHlsSession } from './playerHlsSession';

export function hardStopVideoElement(video: HTMLVideoElement | null | undefined): void {
  if (!video) return;
  try {
    video.pause();
    video.removeAttribute('src');
    video.load();
  } catch {
    /* noop */
  }
}

export function stopAllVideosInRoot(root: ParentNode | null | undefined): void {
  if (!root) return;
  root.querySelectorAll('video').forEach((video) => {
    hardStopVideoElement(video);
  });
}

export function hardStopArtplayerMedia(art: Artplayer, container: HTMLDivElement | null): void {
  try {
    if (art.hls) {
      clearPlayerHlsSession(art.hls);
      art.hls.stopLoad();
      art.hls.detachMedia();
      art.hls.destroy();
      art.hls = null;
    }
  } catch {
    /* noop */
  }

  hardStopVideoElement(art.video);
  stopAllVideosInRoot(container);
  stopAllVideosInRoot(art.template?.$player ?? null);
}

export function pauseOrphanPlayerVideos(
  art: Artplayer,
  extraRoots: (ParentNode | null | undefined)[] = [],
): void {
  const primary = art.video;
  try {
    primary?.pause();
  } catch {
    /* noop */
  }

  const roots: ParentNode[] = [];
  const playerRoot = art.template?.$player;
  if (playerRoot) roots.push(playerRoot);
  for (const root of extraRoots) {
    if (root) roots.push(root);
  }

  roots.forEach((root) => {
    root.querySelectorAll('video').forEach((video) => {
      if (video === primary) return;
      hardStopVideoElement(video);
    });
  });
}

export function hardStopWatchPlayerSurface(
  art: Artplayer,
  container: HTMLDivElement | null,
): void {
  hardStopArtplayerMedia(art, container);
  teardownActivePlayerHlsSession();
  const watchFrame = container?.closest('.watch-player-content__frame');
  stopAllVideosInRoot(watchFrame);
}
