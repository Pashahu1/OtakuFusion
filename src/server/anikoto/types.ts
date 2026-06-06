export interface AnikotoApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface AnikotoInfoData {
  id: string;
  title: string;
  malId?: number;
  anilistId?: number;
  totalSub?: number;
  totalDub?: number;
  [key: string]: unknown;
}

export interface AnikotoSearchRow {
  id: string;
  title: string;
  image?: string;
  type?: string;
  sub?: string | null;
  dub?: string | null;
  episodes?: string | null;
}

export interface AnikotoEpisodeRow {
  num: number;
  title?: string;
  slug?: string;
  isSub?: boolean;
  isDub?: boolean;
  isFiller?: boolean;
}

export interface AnikotoStreamData {
  m3u8: string;
  referer: string;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  subtitles?: Array<{
    file: string;
    label?: string;
    kind?: string;
    default?: boolean;
  }>;
}
