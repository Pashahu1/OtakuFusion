'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import './AnimeCalendar.scss';
import { ScheduleDayHeader } from './anime-schedule/ScheduleDayHeader';
import { ScheduleGridCell } from './anime-schedule/ScheduleGridCell';
import {
  buildWeekDays,
  formatSlotRangeLabel,
  selectedDayIndex,
  slotStartForHour,
  TIME_SLOT_STARTS_HOUR,
} from './anime-schedule/scheduleUtils';
import type { CalendarEvent } from './anime-schedule/scheduleTypes';

export type { CalendarEvent } from './anime-schedule/scheduleTypes';

type Props = {
  events: CalendarEvent[];
  selectedDate: string;
  onDateChange: (data: { year: number; month: number; day: number }) => void;
};

export function AnimeSchedule({ events, selectedDate, onDateChange }: Props) {
  const route = useRouter();

  const days = buildWeekDays(selectedDate);
  const dayIndex = selectedDayIndex(days, selectedDate);
  const selectedDay = days[dayIndex];
  const selectedKey = format(selectedDay, 'yyyy-MM-dd');
  const releaseCount = events.length;

  const visibleSlots = TIME_SLOT_STARTS_HOUR.filter((slotStartHour) =>
    events.some(
      (event) =>
        format(event.start, 'yyyy-MM-dd') === selectedKey &&
        slotStartForHour(event.start.getHours()) === slotStartHour,
    ),
  );

  function handleSelectEvent(animeId: string, episodeNumber: number) {
    const href =
      episodeNumber > 0
        ? `/watch/${animeId}/play?ep=${episodeNumber}`
        : `/watch/${animeId}`;
    route.push(href);
  }

  function selectDay(day: Date) {
    onDateChange({
      year: day.getFullYear(),
      month: day.getMonth(),
      day: day.getDate(),
    });
  }

  return (
    <div className="anime-schedule anime-schedule--compact">
      <div className="schedule-toolbar schedule-toolbar--compact">
        <div className="schedule-days schedule-days--compact">
          {days.map((day) => (
            <ScheduleDayHeader
              key={day.toString()}
              day={day}
              selectedDate={selectedDate}
              releaseCount={releaseCount}
              onSelect={selectDay}
            />
          ))}
        </div>
      </div>

      {visibleSlots.length > 0 ? (
        <div className="schedule-grid">
          {visibleSlots.map((slotStartHour) => (
            <div
              key={slotStartHour}
              className={cn('schedule-row', 'schedule-row--compact')}
            >
              <div
                className="schedule-time"
                title={formatSlotRangeLabel(slotStartHour)}
              >
                {formatSlotRangeLabel(slotStartHour)}
              </div>

              <ScheduleGridCell
                day={selectedDay}
                slotStartHour={slotStartHour}
                events={events}
                onSelectEvent={handleSelectEvent}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
