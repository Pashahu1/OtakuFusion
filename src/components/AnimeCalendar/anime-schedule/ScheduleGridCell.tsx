'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { thumbnailUrl } from '@/shared/utils/thumbnail-url';
import type { CalendarEvent } from './scheduleTypes';
import {
  CALENDAR_POSTER_THUMB,
  formatScheduleTag,
  isAniListCdnHost,
  slotStartForHour,
} from './scheduleUtils';

interface ScheduleGridCellProps {
  day: Date;
  slotStartHour: number;
  events: CalendarEvent[];
  onSelectEvent: (animeId: string, episodeNumber: number) => void;
}

export function ScheduleGridCell({
  day,
  slotStartHour,
  events,
  onSelectEvent,
}: ScheduleGridCellProps) {
  const dayEvents = events
    .filter(
      (e) =>
        format(e.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
        slotStartForHour(e.start.getHours()) === slotStartHour,
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className={cn('schedule-cell', dayEvents.length === 0 && 'schedule-cell--empty')}>
      {dayEvents.map((event, eventIndex) => {
        const resolvedPoster = event.posterUrl?.trim()
          ? thumbnailUrl(event.posterUrl.trim(), CALENDAR_POSTER_THUMB)
          : '';
        const showPosterColumn = Boolean(resolvedPoster);
        const episodeLabel =
          event.episodeNumber > 0 ? `Episode ${event.episodeNumber}` : 'Episode TBA';
        const formatTag = formatScheduleTag(event.format);
        const showPremiere = event.episodeNumber === 1;
        const timeRange = `${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}`;

        return (
          <button
            key={`${event.id}-${event.start.getTime()}-${eventIndex}`}
            type="button"
            className={cn('schedule-event', !showPosterColumn && 'schedule-event--no-poster')}
            aria-label={`${event.title}. ${episodeLabel}. ${timeRange}`}
            onClick={() => onSelectEvent(event.id, event.episodeNumber)}
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
