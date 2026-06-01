'use client';
import React from 'react';
import { format, isToday as isDateToday } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { thumbnailUrl } from '@/shared/utils/thumbnail-url';

import './AnimeCalendar.scss';

const TIME_SLOT_STARTS_HOUR = [0, 4, 8, 12, 16, 20] as const;
const CALENDAR_POSTER_THUMB = '80x120';

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

function isAniListCdnHost(url: string): boolean {
  return url.includes('anilist.co');
}

function formatScheduleTag(raw?: string): string | null {
  if (!raw?.trim()) return null;
  return raw.trim().replace(/_/g, ' ');
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  episodeNumber: number;
  posterUrl: string;
  format?: string;
}

type Props = {
  events: CalendarEvent[];
  selectedDate: string;
  onDateChange: (data: { year: number; month: number; day: number }) => void;
};

export function AnimeSchedule({ events, selectedDate, onDateChange }: Props) {
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
    (d) => format(d, 'yyyy-MM-dd') === selectedDate,
  );
  const selectedDayIndex = foundDayIndex === -1 ? 0 : foundDayIndex;

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

  function renderDayHeader(day: Date) {
    const dateKey = format(day, 'yyyy-MM-dd');
    const active = dateKey === selectedDate;
    const today = isDateToday(day);

    return (
      <button
        key={day.toString()}
        type="button"
        className={cn(
          'schedule-day',
          active && 'schedule-day--active',
          today && 'schedule-day--today',
        )}
        onClick={() => selectDay(day)}
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

  function renderCellForDay(
    day: Date,
    slotStartHour: number,
    cellKey: string,
  ) {
    const dayEvents = events
      .filter(
        (e) =>
          format(e.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
          slotStartForHour(e.start.getHours()) === slotStartHour,
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
      <div
        key={cellKey}
        className={cn(
          'schedule-cell',
          dayEvents.length === 0 && 'schedule-cell--empty',
        )}
      >
        {dayEvents.map((event, eventIndex) => {
          const resolvedPoster = event.posterUrl?.trim()
            ? thumbnailUrl(event.posterUrl.trim(), CALENDAR_POSTER_THUMB)
            : '';
          const showPosterColumn = Boolean(resolvedPoster);
          const episodeLabel =
            event.episodeNumber > 0
              ? `Episode ${event.episodeNumber}`
              : 'Episode TBA';
          const formatTag = formatScheduleTag(event.format);
          const showPremiere = event.episodeNumber === 1;
          const timeRange = `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`;

          return (
            <button
              key={`${event.id}-${event.start.getTime()}-${eventIndex}`}
              type="button"
              className={cn(
                'schedule-event',
                !showPosterColumn && 'schedule-event--no-poster',
              )}
              aria-label={`${event.title}. ${episodeLabel}. ${timeRange}`}
              onClick={() =>
                handleSelectEvent(event.id, event.episodeNumber)
              }
            >
              {showPosterColumn ? (
                <span className="schedule-event__poster" aria-hidden>
                  <Image
                    src={resolvedPoster}
                    alt=""
                    fill
                    className="schedule-event__poster-img"
                    sizes="(max-width: 1023px) 40px, 48px"
                    unoptimized={isAniListCdnHost(resolvedPoster)}
                  />
                </span>
              ) : null}
              <span className="schedule-event__body">
                <span className="schedule-event__title" title={event.title}>
                  {event.title}
                </span>
                <span className="schedule-event__meta">
                  {formatTag ? (
                    <span className="schedule-event__tag">{formatTag}</span>
                  ) : null}
                  {showPremiere ? (
                    <span className="schedule-event__tag schedule-event__tag--premiere">
                      Premiere
                    </span>
                  ) : null}
                  <span className="schedule-event__episode">{episodeLabel}</span>
                </span>
                <span className="schedule-event__time">{timeRange}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('anime-schedule', !isWeekGrid && 'anime-schedule--compact')}>
      <div
        className={cn(
          'schedule-toolbar',
          !isWeekGrid && 'schedule-toolbar--compact',
        )}
      >
        {isWeekGrid ? <div className="schedule-toolbar__spacer" aria-hidden /> : null}
        <div
          className={cn(
            'schedule-days',
            !isWeekGrid && 'schedule-days--compact',
          )}
        >
          {days.map((day) => renderDayHeader(day))}
        </div>
      </div>

      <div className="schedule-grid">
        {TIME_SLOT_STARTS_HOUR.map((slotStartHour) => (
          <div
            key={slotStartHour}
            className={cn(
              'schedule-row',
              !isWeekGrid && 'schedule-row--compact',
            )}
          >
            <div className="schedule-time" title={formatSlotRangeLabel(slotStartHour)}>
              {formatSlotRangeLabel(slotStartHour)}
            </div>

            {isWeekGrid
              ? days.map((day) =>
                  renderCellForDay(
                    day,
                    slotStartHour,
                    `${format(day, 'yyyy-MM-dd')}-${slotStartHour}`,
                  ),
                )
              : renderCellForDay(
                  days[selectedDayIndex],
                  slotStartHour,
                  `slot-${slotStartHour}`,
                )}
          </div>
        ))}
      </div>
    </div>
  );
}
