'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { isDayToday } from './scheduleUtils';

interface ScheduleDayHeaderProps {
  day: Date;
  selectedDate: string;
  releaseCount: number;
  onSelect: (day: Date) => void;
}

export function ScheduleDayHeader({
  day,
  selectedDate,
  releaseCount,
  onSelect,
}: ScheduleDayHeaderProps) {
  const dateKey = format(day, 'yyyy-MM-dd');
  const active = dateKey === selectedDate;
  const today = isDayToday(day);

  return (
    <button
      type="button"
      className={cn(
        'schedule-day',
        active && 'schedule-day--active',
        today && 'schedule-day--today',
      )}
      onClick={() => onSelect(day)}
      aria-current={active ? 'date' : undefined}
      aria-label={`${format(day, 'EEEE, MMMM d')}${today ? ', today' : ''}`}
    >
      <span className="schedule-day__name">{format(day, 'EEE')}</span>
      <span className="schedule-day__num">{format(day, 'dd')}</span>
      {active && releaseCount > 0 ? (
        <span className="schedule-day__count">{releaseCount}</span>
      ) : null}
    </button>
  );
}
