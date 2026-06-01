import { format, isToday as isDateToday } from 'date-fns';

export const TIME_SLOT_STARTS_HOUR = [0, 4, 8, 12, 16, 20] as const;
export const CALENDAR_POSTER_THUMB = '80x120';

export function slotStartForHour(hour: number): number {
  return Math.floor(hour / 4) * 4;
}

export function formatSlotRangeLabel(startHour: number): string {
  const start = `${String(startHour).padStart(2, '0')}:00`;
  if (startHour >= 20) return `${start} – 24:00`;
  const end = startHour + 4;
  return `${start} – ${String(end).padStart(2, '0')}:00`;
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function isAniListCdnHost(url: string): boolean {
  return url.includes('anilist.co');
}

export function formatScheduleTag(raw?: string): string | null {
  if (!raw?.trim()) return null;
  return raw.trim().replace(/_/g, ' ');
}

export function buildWeekDays(selectedDate: string): Date[] {
  const selected = new Date(selectedDate);
  const weekStart = startOfWeekMonday(selected);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function selectedDayIndex(days: Date[], selectedDate: string): number {
  const found = days.findIndex((d) => format(d, 'yyyy-MM-dd') === selectedDate);
  return found === -1 ? 0 : found;
}

export function isDayToday(day: Date): boolean {
  return isDateToday(day);
}
