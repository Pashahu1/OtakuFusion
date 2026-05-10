'use client';
import React, { useCallback } from 'react';
import Image from 'next/image';
import { format, isSameDay } from 'date-fns';
import './AnimeCalendar.scss';
import { useRouter } from 'next/navigation';
import { Convertor } from '@/helper/Convertor';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

const TIME_SLOT_STARTS_HOUR = [0, 4, 8, 12, 16, 20] as const;

function slotStartForHour(hour: number): number {
  return Math.floor(hour / 4) * 4;
}

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

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  episodeNumber: number;
  posterUrl: string;
  /** AniList format (TV, ONA, …) — short tag on the card. */
  format?: string;
}

const CALENDAR_POSTER_THUMB = '80x120';

function isAniListCdnHost(url: string): boolean {
  return url.includes('anilist.co');
}

function formatScheduleTag(raw?: string): string | null {
  if (!raw?.trim()) return null;
  return raw.trim().replace(/_/g, ' ');
}

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
  const isWeekGrid = useMediaQuery('(min-width: 1024px)', false);

  const selected = new Date(selectedDate);
  const weekStart = startOfWeekMonday(selected);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const foundDayIndex = days.findIndex(
    (d) => format(d, 'yyyy-MM-dd') === selectedDate
  );
  const selectedDayIndex = foundDayIndex === -1 ? 0 : foundDayIndex;

  const handleSelectEvent = (event: string) => {
    route.push(`/watch/${event}`);
  };

  const selectDay = useCallback(
    (day: Date) => {
      onDateChange({
        year: day.getFullYear(),
        month: day.getMonth(),
        day: day.getDate(),
      });
    },
    [onDateChange]
  );

  const renderDayHeader = (day: Date) => {
    const active = format(day, 'yyyy-MM-dd') === selectedDate;
    return (
      <div
        key={day.toString()}
        role="button"
        tabIndex={0}
        className={cn('day-header', active && 'active')}
        onClick={() => selectDay(day)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectDay(day);
          }
        }}
      >
        <div className="day-name">{format(day, 'EEE')}</div>
        <div className="day-num">{format(day, 'dd')}</div>
      </div>
    );
  };

  const renderCellForDay = (
    day: Date,
    slotStartHour: number,
    cellKey: string
  ) => {
    const dayEvents = events
      .filter(
        (e) =>
          isSameDay(e.start, day) &&
          slotStartForHour(e.start.getHours()) === slotStartHour
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
      <div key={cellKey} className="schedule-cell">
        {dayEvents.map((event, eventIndex) => {
          const resolvedPoster = event.posterUrl?.trim()
            ? Convertor(event.posterUrl.trim(), CALENDAR_POSTER_THUMB)
            : '';
          const showPosterColumn = Boolean(resolvedPoster);
          const episodeLabel =
            event.episodeNumber > 0
              ? `Episode ${event.episodeNumber}`
              : 'Episode TBA';
          const formatTag = formatScheduleTag(event.format);
          const showPremiere = event.episodeNumber === 1;

          const timeRange = `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`;
          const ariaLabel = `${event.title}. ${episodeLabel}. ${timeRange}`;

          return (
            <div
              key={`${event.id}-${event.start.getTime()}-${eventIndex}`}
              className={cn(
                'event-block',
                !showPosterColumn && 'event-block--no-poster'
              )}
              role="button"
              tabIndex={0}
              aria-label={ariaLabel}
              onClick={() => handleSelectEvent(event.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectEvent(event.id);
                }
              }}
            >
              {showPosterColumn ? (
                <div className="event-poster-wrap" aria-hidden>
                  <Image
                    src={resolvedPoster}
                    alt=""
                    fill
                    className="event-poster-img"
                    sizes="(max-width: 1023px) 40px, 48px"
                    unoptimized={isAniListCdnHost(resolvedPoster)}
                  />
                </div>
              ) : null}
              <div className="event-body">
                <div className="event-title" title={event.title}>
                  {event.title}
                </div>
                <div className="event-meta">
                  {formatTag ? (
                    <span className="event-format-tag">{formatTag}</span>
                  ) : null}
                  {showPremiere ? (
                    <span className="event-premiere-tag">Premiere</span>
                  ) : null}
                  <span className="event-episode">{episodeLabel}</span>
                </div>
                <div className="event-time">{timeRange}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn('anime-schedule', !isWeekGrid && 'anime-schedule--compact')}>
      <div
        className={cn(
          'schedule-header',
          !isWeekGrid && 'schedule-header--compact'
        )}
      >
        {isWeekGrid ? <div className="time-col-header" aria-hidden /> : null}
        {days.map((day) => renderDayHeader(day))}
      </div>

      <div className="schedule-body">
        {TIME_SLOT_STARTS_HOUR.map((slotStartHour) => (
          <div
            key={slotStartHour}
            className={cn('schedule-row', !isWeekGrid && 'schedule-row--compact')}
          >
            <div
              className="time-col"
              title={formatSlotRangeLabel(slotStartHour)}
            >
              {formatSlotRangeLabel(slotStartHour)}
            </div>

            {isWeekGrid
              ? days.map((day) =>
                  renderCellForDay(
                    day,
                    slotStartHour,
                    `${format(day, 'yyyy-MM-dd')}-${slotStartHour}`
                  )
                )
              : renderCellForDay(
                  days[selectedDayIndex],
                  slotStartHour,
                  `slot-${slotStartHour}`
                )}
          </div>
        ))}
      </div>
    </div>
  );
};
