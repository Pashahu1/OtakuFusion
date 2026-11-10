import type Artplayer from 'artplayer';

import { PLAYER_SKIP_SECONDS } from '../playerConstants';

export function clampPlaybackTime(time: number, duration: number): number {
  if (!Number.isFinite(time) || time < 0) return 0;
  if (!Number.isFinite(duration) || duration <= 0) return time;
  return Math.min(time, Math.max(0, duration - 0.05));
}

export function skipPlaybackBy(
  art: Pick<Artplayer, 'currentTime' | 'duration'>,
  deltaSeconds: number = PLAYER_SKIP_SECONDS,
): number {
  const next = clampPlaybackTime(art.currentTime + deltaSeconds, art.duration);
  art.currentTime = next;
  return next;
}
