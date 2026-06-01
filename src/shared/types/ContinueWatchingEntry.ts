export interface ContinueWatchingEntry {
  id: string;
  data_id: number;
  episodeId: string;
  episodeNum?: number;
  poster?: string;
  title?: string;
  japanese_title?: string;
  adultContent?: boolean;
  genres?: string[];
  /** Seconds into current episode (for resume + UI). */
  positionSeconds?: number;
  /** Episode duration in seconds. */
  durationSeconds?: number;
  /** For MRU sort (legacy entries without field → 0). */
  updatedAt?: number;
}
