/** Mark episode watched ~3.5 min before end (credits/outro). */
export const EPISODE_WATCHED_BEFORE_END_SEC = 210;

/** Suggest next episode ~2 min before end. */
export const EPISODE_UP_NEXT_BEFORE_END_SEC = 120;

const SHORT_EPISODE_WATCHED_PROGRESS = 0.85;
const SHORT_EPISODE_UP_NEXT_PROGRESS = 0.9;

export function getVideoRemainingSeconds(
  currentTime: number,
  duration: number,
): number | null {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }
  return Math.max(0, duration - currentTime);
}

export function shouldMarkEpisodeWatched(
  currentTime: number,
  duration: number,
): boolean {
  const remaining = getVideoRemainingSeconds(currentTime, duration);
  if (remaining == null) return false;

  if (duration <= EPISODE_WATCHED_BEFORE_END_SEC * 2) {
    return currentTime / duration >= SHORT_EPISODE_WATCHED_PROGRESS;
  }

  return remaining <= EPISODE_WATCHED_BEFORE_END_SEC;
}

export function shouldPromptUpNext(currentTime: number, duration: number): boolean {
  const remaining = getVideoRemainingSeconds(currentTime, duration);
  if (remaining == null) return false;

  if (duration <= EPISODE_UP_NEXT_BEFORE_END_SEC * 2) {
    return currentTime / duration >= SHORT_EPISODE_UP_NEXT_PROGRESS;
  }

  return remaining <= EPISODE_UP_NEXT_BEFORE_END_SEC;
}

/** Up next wins over Skip ED when a next episode exists (no duplicate CTAs). */
export function shouldSuppressOutroSkipForUpNext(
  currentTime: number,
  duration: number,
  hasNextEpisode: boolean,
): boolean {
  return hasNextEpisode && shouldPromptUpNext(currentTime, duration);
}
