'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import './AnimeCalendar.scss';
import { ScheduleDayHeader } from './anime-schedule/ScheduleDayHeader';
import { ScheduleGridCell } from './anime-schedule/ScheduleGridCell';
import {
  buildWeekDays,
  formatSlotRangeLabel,
  selectedDayIndex,
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
  const isWeekGrid = useMediaQuery('(min-width: 1024px)', false);

  const days = buildWeekDays(selectedDate);
  const dayIndex = selectedDayIndex(days, selectedDate);
  const releaseCount = events.length;

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
    <div className={cn('anime-schedule', !isWeekGrid && 'anime-schedule--compact')}>
      <div
        className={cn('schedule-toolbar', !isWeekGrid && 'schedule-toolbar--compact')}
      >
        {isWeekGrid ? <div className="schedule-toolbar__spacer" aria-hidden /> : null}
        <div className={cn('schedule-days', !isWeekGrid && 'schedule-days--compact')}>
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

      <div className="schedule-grid">
        {TIME_SLOT_STARTS_HOUR.map((slotStartHour) => (
          <div
            key={slotStartHour}
            className={cn('schedule-row', !isWeekGrid && 'schedule-row--compact')}
          >
            <div className="schedule-time" title={formatSlotRangeLabel(slotStartHour)}>
              {formatSlotRangeLabel(slotStartHour)}
            </div>

            {isWeekGrid
              ? days.map((day) => (
                  <ScheduleGridCell
                    key={`${format(day, 'yyyy-MM-dd')}-${slotStartHour}`}
                    day={day}
                    slotStartHour={slotStartHour}
                    events={events}
                    onSelectEvent={handleSelectEvent}
                  />
                ))
              : (
                <ScheduleGridCell
                  day={days[dayIndex]}
                  slotStartHour={slotStartHour}
                  events={events}
                  onSelectEvent={handleSelectEvent}
                />
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
