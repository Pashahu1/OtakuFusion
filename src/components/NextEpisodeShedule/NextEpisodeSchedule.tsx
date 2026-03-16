import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

function formatScheduleDate(isoString: string): string {
  return new Date(
    new Date(isoString).getTime() - new Date().getTimezoneOffset() * 60000
  ).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export const NextEpisodeSchedule = ({
  nextEpisodeSchedule,
  isLoading,
}: {
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  isLoading?: boolean;
}) => {
  const schedule = nextEpisodeSchedule?.nextEpisodeSchedule;

  if (!schedule) {
    if (isLoading) {
      return (
        <Skeleton
          className="h-[14px] w-[200px] shrink-0 max-[500px]:w-[160px]"
          aria-hidden
        />
      );
    }
    return null;
  }

  return (
    <p className="flex flex-wrap items-center gap-x-1 text-xs text-white/55">
      <span>Next episode: {formatScheduleDate(schedule)}</span>
    </p>
  );
};
