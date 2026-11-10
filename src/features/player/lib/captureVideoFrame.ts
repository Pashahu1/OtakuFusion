import {
  averageLumaFromRgba,
  isLumaTooDark,
} from '@/features/player/lib/episode-preview-capture';

const CAPTURE_MAX_WIDTH = 640;
const JPEG_QUALITY = 0.72;

export interface CaptureVideoFrameOptions {
  rejectDark?: boolean;
}

export async function captureVideoFrame(
  video: HTMLVideoElement,
  options: CaptureVideoFrameOptions = {},
): Promise<Blob | null> {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

  const sourceWidth = video.videoWidth;
  const sourceHeight = video.videoHeight;
  if (!sourceWidth || !sourceHeight) return null;

  const scale = Math.min(1, CAPTURE_MAX_WIDTH / sourceWidth);
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(video, 0, 0, width, height);
  } catch {
    return null;
  }

  if (options.rejectDark !== false) {
    try {
      const { data } = ctx.getImageData(0, 0, width, height);
      if (isLumaTooDark(averageLumaFromRgba(data))) return null;
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', JPEG_QUALITY);
  });
}
