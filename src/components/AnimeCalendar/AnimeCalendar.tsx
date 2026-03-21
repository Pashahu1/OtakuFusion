'use client';
import React from 'react';
import './AnimeCalendar.scss';
import { AnimeSchedule } from './AnimeSchedule';
import type { CalendarEvent } from './AnimeSchedule';

type Props = {
  events: CalendarEvent[];
  onDateChange: (data: { year: number; month: number; day: number }) => void;
  selectedDate: string;
};

export function AnimeCalendarComponent({
  events,
  onDateChange,
  selectedDate,
}: Props) {
  return (
    <div className="calendar block w-full min-w-[700px] max-w-full md:min-w-0">
      <AnimeSchedule
        events={events}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />
    </div>
  );
}

AnimeCalendarComponent.displayName = 'AnimeCalendar';

const AnimeCalendar = React.memo(AnimeCalendarComponent);
