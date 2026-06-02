import type Artplayer from 'artplayer';

export function hardStopVideoElement(video: HTMLVideoElement | null | undefined): void {
  if (!video) return;
  try {
    video.pause();
    video.muted = true;
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
