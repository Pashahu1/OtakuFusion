import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';

export function continueWatchingEpisodeParam(item: ContinueWatchingEntry): string {
  if (item.episodeNum != null && Number.isFinite(item.episodeNum)) {
    return String(item.episodeNum);
  }
  return getEpisodeNumberFromId(item.episodeId) ?? item.episodeId;
}

export function continueWatchingProgressRatio(
  positionSeconds?: number,
  durationSeconds?: number,
): number {
  if (
    positionSeconds == null ||
    durationSeconds == null ||
    !Number.isFinite(positionSeconds) ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return 0;
  }
  return Math.min(1, Math.max(0, positionSeconds / durationSeconds));
}

export function continueWatchingTimeLeftLabel(
  positionSeconds?: number,
  durationSeconds?: number,
): string | null {
  if (
    positionSeconds == null ||
    durationSeconds == null ||
    !Number.isFinite(positionSeconds) ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= positionSeconds
  ) {
    return null;
  }
  const minutesLeft = Math.max(1, Math.ceil((durationSeconds - positionSeconds) / 60));
  return `${minutesLeft}m left`;
}
