/** Mark episode watched ~3.5 min before end (credits/outro). */
export const EPISODE_WATCHED_BEFORE_END_SEC = 210;

/** Up next + fallback skip credits window — 3 min before end. */
export const EPISODE_UP_NEXT_BEFORE_END_SEC = 180;

/** Seek target when skipping credits without ED markers. */
export const EPISODE_CREDITS_SKIP_LAND_SEC = 3;

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

export function shouldShowCreditsSkipFallback(
  currentTime: number,
  duration: number,
  hasOutroSegment: boolean,
): boolean {
  if (hasOutroSegment) return false;

  const remaining = getVideoRemainingSeconds(currentTime, duration);
  if (remaining == null) return false;

  return remaining <= EPISODE_UP_NEXT_BEFORE_END_SEC && remaining > EPISODE_CREDITS_SKIP_LAND_SEC;
}
