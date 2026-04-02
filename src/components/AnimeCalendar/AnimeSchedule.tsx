'use client';
import React from 'react';
import { format, isSameDay } from 'date-fns';
import './AnimeCalendar.scss';
import { useRouter } from 'next/navigation';

/** Фіксовані мітки доби кожні 4 год (00→20); слот 20:00 покриває 20:00–24:00 */
const TIME_SLOT_STARTS_HOUR = [0, 4, 8, 12, 16, 20] as const;

function slotStartForHour(hour: number): number {
  return Math.floor(hour / 4) * 4;
}

/** Підпис слота: 08:00 – 12:00 … останній 20:00 – 24:00 */
function formatSlotRangeLabel(startHour: number): string {
  const start = `${String(startHour).padStart(2, '0')}:00`;
  if (startHour >= 20) return `${start} – 24:00`;
  const end = startHour + 4;
  return `${start} – ${String(end).padStart(2, '0')}:00`;
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};

type Props = {
  events: CalendarEvent[];
  selectedDate: string;
  onDateChange: (data: { year: number; month: number; day: number }) => void;
};

export const AnimeSchedule: React.FC<Props> = ({
  events,
  selectedDate,
  onDateChange,
}) => {
  const route = useRouter();

  const selected = new Date(selectedDate);
  const weekStart = startOfWeekMonday(selected);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

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
        {TIME_SLOT_STARTS_HOUR.map((slotStartHour) => (
          <div key={slotStartHour} className="schedule-row">
            <div
              className="time-col"
              title={formatSlotRangeLabel(slotStartHour)}
            >
              {formatSlotRangeLabel(slotStartHour)}
            </div>

            {days.map((day) => {
              const dayEvents = events
                .filter(
                  (e) =>
                    isSameDay(e.start, day) &&
                    slotStartForHour(e.start.getHours()) === slotStartHour
                )
                .sort(
                  (a, b) => a.start.getTime() - b.start.getTime()
                );

              return (
                <div key={day.toString()} className="schedule-cell">
                  {dayEvents.map((event, eventIndex) => (
                    <div
                      key={`${event.id}-${event.start.getTime()}-${eventIndex}`}
                      className="event-block"
                      onClick={() => handleSelectEvent(event.id)}
                    >
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
