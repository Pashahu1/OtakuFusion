export interface ContinueWatchingEntry {
  id: string;
  data_id: number;
  episodeId: string;
  episodeNum?: number;
  poster?: string;
  title?: string;
  japanese_title?: string;
  adultContent?: boolean;
  /** Для сортування MRU (старі записи без поля → 0). */
  updatedAt?: number;
}
