import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

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
}: {
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
}) => {
  const schedule = nextEpisodeSchedule?.nextEpisodeSchedule;
  if (!schedule) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-1 text-xs text-white/55">
      <span>Next episode: {formatScheduleDate(schedule)}</span>
    </p>
  );
};
