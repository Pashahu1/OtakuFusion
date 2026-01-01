'use client';
import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { getNextEpisodesAnime } from '@/services/getNextEpisodesAnime';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import type { ScheduleAnime } from '@/shared/types/GlobalTypes';
import AnimeCalendar from '@/components/AnimeCalendar/AnimeCalendar';
import ErrorState from '@/components/ui/states/ErrorState';

const timeZone = 'Europe/Kyiv';
const now = new Date();

const kyivTime = toZonedTime(now, timeZone);
const formattedKyivTime = format(kyivTime, 'yyyy-MM-dd');

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleAnime[]>([]);
  const [selectedDate, setSelectedDate] = useState(formattedKyivTime);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const handleDateChange = useCallback(
    ({ year, month, day }: { year: number; month: number; day: number }) => {
      const date = new Date(year, month, day);
      const formatted = format(toZonedTime(date, timeZone), 'yyyy-MM-dd');
      setSelectedDate(formatted);
    },
    []
  );

  const event = events.map((item) => {
    const start = new Date(`${item.releaseDate}T${item.time}`);
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
        setIsLoading(false);
      } catch {
        setError(true);
        console.error('failed data fetching');
      }
    };
    fetchSheduleAnime();
  }, [selectedDate]);

  return (
    <div className="flex flex-col min-h-screen">
      {error && <ErrorState message="Failed to load shedule page." />}
      {isLoading && <InitialLoader />}

      {!isLoading && (
        <div className="mt-[60px]">
          <AnimeCalendar
            events={event}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
          />
        </div>
      )}
    </div>
  );
}
