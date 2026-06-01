export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  episodeNumber: number;
  posterUrl: string;
  format?: string;
}
