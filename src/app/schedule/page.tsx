'use client';
import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getNextEpisodesAnime } from '@/services/getNextEpisodesAnime';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import type { ScheduleAnime } from '@/shared/types/GlobalTypes';
import AnimeCalendar from '@/components/AnimeCalendar/AnimeCalendar';
import ErrorState from '@/components/ui/states/ErrorState';
import { normalizeError } from '@/lib/errors/normalizeError';
import EmptyState from '@/components/ui/states/EmptyState';

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
    const fetchSheduleAnime = async () => {
      setIsLoading(true);
      try {
        const res = await getNextEpisodesAnime(selectedDate);
        setEvents(res);
        console.log(res);
      } catch (err) {
        const normalizedError = normalizeError(err);
        setEvents([]);
        setError(normalizedError);
        console.error('failed data fetching schedule anime', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSheduleAnime();
  }, [selectedDate]);

  {
    isLoading && <InitialLoader />;
  }

  if (error) {
    return <ErrorState fullPage message="Failed to load schedule." />;
  }
  if (!Array.isArray(events) || events.length === 0) {
    return <EmptyState fullPage message="No releases today" />;
  }
  return (
    <div className="flex flex-col min-h-screen">
      <div className="mt-[60px]">
        <AnimeCalendar
          selectedDate={selectedDate}
          events={event}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  );
}
