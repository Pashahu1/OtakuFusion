'use client';
import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import './AnimeCalendar.scss';
import { useRouter } from 'next/navigation';
import { isSameDay } from 'date-fns';
import { EventCard } from './EventCard';
import { Toolbar } from './Toolbar';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Props = {
  events: any;
  onDateChange: (data: { year: number; month: number; day: number }) => void;
  selectedDate: string;
};

const AnimeCalendar = React.memo(
  ({ events, onDateChange, selectedDate }: Props) => {
    const route = useRouter();

    const handleSelectEvent = (event: any) => {
      route.push(`/watch/${event.id}`);
    };

    return (
      <div className="calendar">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view="week"
          components={{
            event: EventCard,
            toolbar: Toolbar,
          }}
          onSelectEvent={handleSelectEvent}
          onNavigate={(date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();
            onDateChange({ year, month, day });
          }}
        />
      </div>
    );
  }
);

export default AnimeCalendar;
