import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const SCHEDULE_TIME_ZONE = 'Europe/Kyiv';

export function getKyivScheduleDateString(date = new Date()): string {
  return format(toZonedTime(date, SCHEDULE_TIME_ZONE), 'yyyy-MM-dd');
}

export function formatKyivScheduleDateFromParts(parts: {
  year: number;
  month: number;
  day: number;
}): string {
  const date = new Date(parts.year, parts.month, parts.day);
  return format(toZonedTime(date, SCHEDULE_TIME_ZONE), 'yyyy-MM-dd');
}

export function formatScheduleDayLabel(dateString: string): string {
  return format(toZonedTime(new Date(dateString), SCHEDULE_TIME_ZONE), 'EEEE, MMMM d');
}

export function formatScheduleTimeZoneLabel(): string {
  return SCHEDULE_TIME_ZONE.replace('_', ' ');
}
