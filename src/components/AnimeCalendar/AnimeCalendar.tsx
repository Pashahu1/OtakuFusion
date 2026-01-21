'use client';
import React from 'react';
import './AnimeCalendar.scss';
import { AnimeSchedule } from './AnimeSchedule';

type Props = {
  events: any;
  onDateChange: (data: { year: number; month: number; day: number }) => void;
  selectedDate: string;
};

const AnimeCalendar = React.memo(
  ({ events, onDateChange, selectedDate }: Props) => {

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
);

export default AnimeCalendar;
