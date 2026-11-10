'use client';

import { useTranslation } from 'react-i18next';

import { appLocaleToBcp47 } from '@/i18n/locales';
import i18n from '@/i18n/config';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

function formatScheduleDate(isoString: string, locale: string): string {
  const bcp47 = appLocaleToBcp47(locale);
  return new Date(
    new Date(isoString).getTime() - new Date().getTimezoneOffset() * 60000
  ).toLocaleDateString(bcp47, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: bcp47.startsWith('en'),
  });
}

export const NextEpisodeSchedule = ({
  nextEpisodeSchedule,
  isLoading,
}: {
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation('common');
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
      <span>
        {t('watch.nextEpisode', { date: formatScheduleDate(schedule, i18n.language) })}
      </span>
    </p>
  );
};
