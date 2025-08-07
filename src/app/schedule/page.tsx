"use client";
import React, { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getNextEpisodesAnime } from "@/services/getNextEpisodesAnime";
import { InitialLoader } from "@/components/ui/InitialLoader/InitialLoader";
import { WrapperLayout } from "@/components/Layout/WrapperLayout";
import type { ScheduleAnime } from "@/shared/types/GlobalTypes";
import ErrorMessage from "@/components/Error/ErrorMessage";
import AnimeCalendar from "@/components/AnimeCalendar/AnimeCalendar";

const timeZone = "Europe/Kyiv";
const now = new Date();

const kyivTime = toZonedTime(now, timeZone);
const formattedKyivTime = format(kyivTime, "yyyy-MM-dd");

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleAnime[]>([]);
  const [selectedDate, setSelectedDate] = useState(formattedKyivTime);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const handleDateChange = useCallback(
    ({ year, month, day }: { year: number; month: number; day: number }) => {
      const date = new Date(year, month, day);
      const formatted = format(toZonedTime(date, timeZone), "yyyy-MM-dd");
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
        console.error("failed data fetching");
      }
    };
    fetchSheduleAnime();
  }, [selectedDate]);

  return (
    <div className="schedule-page">
      {error && <ErrorMessage message="Failed to load shedule page." />}
      {isLoading && <InitialLoader />}
      <WrapperLayout>
        {!isLoading && (
          <div className="py-4">
            <AnimeCalendar events={event} onDateChange={handleDateChange} />
          </div>
        )}
      </WrapperLayout>
    </div>
  );
}
