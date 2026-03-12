'use client';
import React from 'react';
import './AnimeCalendar.scss';
import { AnimeSchedule } from './AnimeSchedule';

type Props = {
  events: any;
  onDateChange: (data: { year: number; month: number; day: number }) => void;
  selectedDate: string;
};

export function AnimeCalendarComponent({
  events,
  onDateChange,
  selectedDate,
}: Props) {
  return (
    <div className="calendar">
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
