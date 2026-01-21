'use client';
import React from 'react';
import { format, isSameDay } from 'date-fns';
import './AnimeCalendar.scss';
import { useRouter } from 'next/navigation';

type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

type Props = {
  events: Event[];
  selectedDate: string;
  onDateChange: (data: { year: number; month: number; day: number }) => void;
};

export const AnimeSchedule: React.FC<Props> = ({
  events,
  selectedDate,
  onDateChange,
}) => {
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const route = useRouter();

  const selected = new Date(selectedDate);
  const weekStart = startOfWeek(selected);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 24 }).map((_, i) => i);

  const handleSelectEvent = (event: string) => {
    route.push(`/watch/${event}`);
  };

  return (
    <div className="anime-schedule">
      <div className="schedule-header">
        <div className="time-col-header"></div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className={`day-header ${
              format(day, 'yyyy-MM-dd') === selectedDate ? 'active' : ''
            }`}
            onClick={() =>
              onDateChange({
                year: day.getFullYear(),
                month: day.getMonth(),
                day: day.getDate(),
              })
            }
          >
            <div className="day-name">{format(day, 'EEE')}</div>
            <div className="day-num">{format(day, 'dd')}</div>
          </div>
        ))}
      </div>

      <div className="schedule-body">
        {hours.map((hour) => (
          <div key={hour} className="schedule-row">
            <div className="time-col">
              {hour.toString().padStart(2, '0')}:00
            </div>

            {days.map((day) => {
              const dayEvents = events.filter(
                (e) => isSameDay(e.start, day) && e.start.getHours() === hour
              );

              return (
                <div key={day.toString()} className="schedule-cell">
                  {dayEvents.map((event) => (
                    <div key={event.id} className="event-block" onClick={() => handleSelectEvent(event.id)}>
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">
                        {format(event.start, 'HH:mm')} –{' '}
                        {format(event.end, 'HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
