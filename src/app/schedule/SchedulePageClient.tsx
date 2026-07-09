'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toZonedTime } from 'date-fns-tz';
import { CalendarDays, Loader2 } from 'lucide-react';

import { AnimeCalendarComponent as AnimeCalendar } from '@/components/AnimeCalendar/AnimeCalendar';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { useScheduleQuery } from '@/hooks/queries';
import { normalizeError } from '@/lib/errors/normalizeError';
import {
  formatKyivScheduleDateFromParts,
  formatScheduleDayLabel,
  formatScheduleTimeZoneLabel,
  SCHEDULE_TIME_ZONE,
} from '@/lib/schedule/schedule-timezone';
import { toast } from '@/lib/toast';
import type { ScheduleAnime } from '@/shared/types/GlobalAnimeTypes';

import './schedule-page.scss';

interface SchedulePageClientProps {
  initialDate: string;
}

export default function SchedulePageClient({ initialDate }: SchedulePageClientProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const {
    data: events = [],
    isPending,
    isFetching,
    isError,
    error,
    isFetched,
  } = useScheduleQuery(selectedDate);

  useEffect(() => {
    if (!isError || !isFetched || events.length > 0) return;
    const normalizedError = normalizeError(error);
    toast.error(
      normalizedError.message ?? 'Could not load the schedule for this day.',
    );
  }, [isError, isFetched, events.length, error]);

  const handleDateChange = useCallback(
    ({ year, month, day }: { year: number; month: number; day: number }) => {
      setSelectedDate(formatKyivScheduleDateFromParts({ year, month, day }));
    },
    [],
  );

  const calendarEvents = useMemo(
    () =>
      events.map((item: ScheduleAnime) => {
        const start = toZonedTime(`${item.releaseDate}T${item.time}`, SCHEDULE_TIME_ZONE);
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        return {
          id: item.id,
          title: item.title,
          episodeNumber: item.episode_no,
          posterUrl: item.poster,
          format: item.format,
          start,
          end,
        };
      }),
    [events],
  );

  if (isPending) {
    return <InitialLoader />;
  }

  if (isError && events.length === 0) {
    return <ErrorState fullPage message="Failed to load schedule." />;
  }

  const showCalendarOverlay = isFetching && isFetched;
  const selectedLabel = formatScheduleDayLabel(selectedDate);

  return (
    <div className="schedule-page">
      <div className="schedule-page__shell">
        <header className="schedule-page__header">
          <div className="schedule-page__header-icon" aria-hidden>
            <CalendarDays size={22} />
          </div>
          <div>
            <h1 className="schedule-page__title">Release schedule</h1>
            <p className="schedule-page__subtitle">
              {selectedLabel} · times in {formatScheduleTimeZoneLabel()}
            </p>
          </div>
          {isFetched && events.length > 0 ? (
            <span className="schedule-page__badge">
              {events.length} {events.length === 1 ? 'release' : 'releases'}
            </span>
          ) : null}
        </header>

        <div className="schedule-page__calendar-wrap">
          <AnimeCalendar
            selectedDate={selectedDate}
            events={calendarEvents}
            onDateChange={handleDateChange}
          />

          {showCalendarOverlay ? (
            <div
              className="schedule-page__overlay"
              aria-busy="true"
              aria-live="polite"
              role="status"
            >
              <Loader2 className="schedule-page__overlay-spinner" aria-hidden />
              <span>Updating schedule…</span>
            </div>
          ) : null}
        </div>

        {isFetched && !isFetching && events.length === 0 ? (
          <p className="schedule-page__empty">
            No releases on this day — pick another date in the week strip above.
          </p>
        ) : null}
      </div>
    </div>
  );
}
