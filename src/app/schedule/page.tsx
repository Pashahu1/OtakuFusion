'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Loader2 } from 'lucide-react';
import { getNextEpisodesAnime } from '@/services/getNextEpisodesAnime';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import type { ScheduleAnime } from '@/shared/types/GlobalAnimeTypes';
import { AnimeCalendarComponent as AnimeCalendar } from '@/components/AnimeCalendar/AnimeCalendar';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { normalizeError } from '@/lib/errors/normalizeError';
import { toast } from '@/lib/toast';

const timeZone = 'Europe/Kyiv';
const now = new Date();

const kyivTime = toZonedTime(now, timeZone);
const formattedKyivTime = format(kyivTime, 'yyyy-MM-dd');

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleAnime[]>([]);
  const [selectedDate, setSelectedDate] = useState(formattedKyivTime);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof normalizeError> | null>(
    null
  );
  /** After the first completed request — overlay instead of full-page loader */
  const [hasCompletedInitialFetch, setHasCompletedInitialFetch] =
    useState(false);
  const fetchCompletedOnceRef = useRef(false);

  const handleDateChange = useCallback(
    ({ year, month, day }: { year: number; month: number; day: number }) => {
      const date = new Date(year, month, day);
      const formatted = format(toZonedTime(date, timeZone), 'yyyy-MM-dd');
      setSelectedDate(formatted);
    },
    []
  );

  const event = events.map((item) => {
    const start = toZonedTime(`${item.releaseDate}T${item.time}`, timeZone);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return {
      id: item.id,
      title: `${item.title} - Episode ${item.episode_no}`,
      start,
      end,
      japanese_title: item.japanese_title,
    };
  });

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchScheduleAnime = async () => {
      try {
        const res = await getNextEpisodesAnime(selectedDate);
        setEvents(res);
      } catch (err) {
        const normalizedError = normalizeError(err);
        console.error('failed data fetching schedule anime', err);
        if (fetchCompletedOnceRef.current) {
          toast.error(
            normalizedError.message ??
              'Could not load the schedule for this day.'
          );
        } else {
          setEvents([]);
          setError(normalizedError);
        }
      } finally {
        setIsLoading(false);
        fetchCompletedOnceRef.current = true;
        setHasCompletedInitialFetch(true);
      }
    };

    void fetchScheduleAnime();
  }, [selectedDate]);

  if (!hasCompletedInitialFetch && isLoading) {
    return <InitialLoader />;
  }

  if (error) {
    return <ErrorState fullPage message="Failed to load schedule." />;
  }

  const showCalendarOverlay = isLoading && hasCompletedInitialFetch;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 flex-col items-center px-3 pb-10 pt-[76px] sm:px-5 sm:pt-[92px] lg:px-10 lg:pt-[108px]">
        <div className="relative w-full overflow-x-auto">
          <AnimeCalendar
            selectedDate={selectedDate}
            events={event}
            onDateChange={handleDateChange}
          />
          {showCalendarOverlay ? (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-brand-gray)]/60 backdrop-blur-[2px] transition-opacity duration-200"
              aria-busy="true"
              aria-live="polite"
              role="status"
            >
              <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-600/80 bg-zinc-900/95 px-8 py-6 shadow-xl">
                <Loader2
                  className="h-9 w-9 shrink-0 animate-spin text-[var(--color-brand-orange)]"
                  aria-hidden
                />
                <span className="text-xs font-medium tracking-wide text-zinc-400">
                  Updating schedule…
                </span>
              </div>
            </div>
          ) : null}
        </div>
        {!isLoading && events.length === 0 ? (
          <p className="mt-6 max-w-md text-center text-sm text-zinc-400">
            No releases on this day — pick another date in the calendar.
          </p>
        ) : null}
      </div>
    </div>
  );
}
