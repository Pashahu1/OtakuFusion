const PREVIEW_FRACTION_MIN = 0.18;
const PREVIEW_FRACTION_SPAN = 0.22;
const MIN_CAPTURE_SECONDS = 18;
const DARK_LUMA_THRESHOLD = 22;

export function hashEpisodeKey(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Jittered mid-episode time so thumbs look like a scene, not the intro/credits.
 * Range is roughly 18–40% of duration, clamped away from the very start/end.
 */
export function episodePreviewCaptureAtSeconds(
  episodeKey: string,
  duration: number,
): number {
  if (!Number.isFinite(duration) || duration <= 0) return MIN_CAPTURE_SECONDS;

  const fraction =
    PREVIEW_FRACTION_MIN +
    (hashEpisodeKey(episodeKey) % Math.round(PREVIEW_FRACTION_SPAN * 100 + 1)) / 100;
  const target = duration * fraction;
  const minTime = Math.min(MIN_CAPTURE_SECONDS, duration * 0.15);
  const maxTime = Math.max(minTime, duration * 0.72);

  return Math.min(maxTime, Math.max(minTime, target));
}

export function isLumaTooDark(averageLuma: number): boolean {
  return !Number.isFinite(averageLuma) || averageLuma < DARK_LUMA_THRESHOLD;
}

export function averageLumaFromRgba(
  data: ArrayLike<number>,
  sampleStep = 16,
): number {
  if (data.length < 4) return 0;

  let sum = 0;
  let count = 0;
  const stride = Math.max(1, sampleStep) * 4;

  for (let index = 0; index < data.length; index += stride) {
    const red = data[index] ?? 0;
    const green = data[index + 1] ?? 0;
    const blue = data[index + 2] ?? 0;
    sum += 0.299 * red + 0.587 * green + 0.114 * blue;
    count += 1;
  }

  return count > 0 ? sum / count : 0;
}
