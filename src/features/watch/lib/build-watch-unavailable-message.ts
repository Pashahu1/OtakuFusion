import { formatWatchScheduleDate } from '@/features/watch/lib/format-watch-schedule-date';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

interface BuildWatchUnavailableMessageParams {
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  releaseDate?: string | null;
}

export function buildWatchUnavailableMessage({
  nextEpisodeSchedule,
  releaseDate,
}: BuildWatchUnavailableMessageParams): string {
  const nextIso = nextEpisodeSchedule?.nextEpisodeSchedule?.trim();
  if (nextIso) {
    return `The first episode hasn't aired yet. Next episode expected ${formatWatchScheduleDate(nextIso)}.`;
  }

  const release = releaseDate?.trim();
  if (release) {
    return `This title hasn't released yet. Expected release: ${formatWatchScheduleDate(release)}.`;
  }

  return 'No episodes are available yet. Check back later.';
}
