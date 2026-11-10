const PIP_PERMISSION_ERROR = /permissions check failed/i;

export function isPictureInPicturePermissionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return PIP_PERMISSION_ERROR.test(message);
}

export function releaseVideoPictureInPicture(
  video: HTMLVideoElement | null | undefined,
): void {
  if (!video) return;

  try {
    if (document.pictureInPictureElement === video) {
      void document.exitPictureInPicture().catch(() => undefined);
    }
  } catch {
    /* noop */
  }

  try {
    video.disablePictureInPicture = true;
  } catch {
    /* noop */
  }
}

export function bindSafePictureInPicture(video: HTMLVideoElement | null | undefined): void {
  if (!video || video.dataset.ofPipSafe === '1') return;
  if (typeof video.requestPictureInPicture !== 'function') return;

  video.dataset.ofPipSafe = '1';
  const requestPip = video.requestPictureInPicture.bind(video);
  video.requestPictureInPicture = () =>
    requestPip().catch((error: unknown) => {
      if (isPictureInPicturePermissionError(error)) {
        return undefined as unknown as PictureInPictureWindow;
      }
      throw error;
    });
}

export function swallowPictureInPictureRejections(): () => void {
  const onRejection = (event: PromiseRejectionEvent) => {
    if (!isPictureInPicturePermissionError(event.reason)) return;
    event.preventDefault();
  };

  window.addEventListener('unhandledrejection', onRejection);
  return () => window.removeEventListener('unhandledrejection', onRejection);
}

