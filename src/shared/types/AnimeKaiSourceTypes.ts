/**
 * Відповідь GET /api/source/<link_id> (після ланцюжка search → anime → episodes → servers).
 * Поле Author з API можна ігнорувати в бізнес-логіці.
 */
export interface AnimeKaiSourceSkip {
  /** Пара [start, end] у секундах для пропуску заставки */
  intro?: [number, number];
  /** Пара [start, end] у секундах для пропуску ED */
  outro?: [number, number];
}

export interface AnimeKaiSourceItem {
  file: string;
  label?: string;
  type?: string;
}

export interface AnimeKaiTrackItem {
  file?: string;
  url?: string;
  kind?: string;
  label?: string;
  lang?: string;
  default?: boolean;
}

export interface AnimeKaiSourceResponse {
  Author?: string;
  success?: boolean;
  error?: string;
  embed_url?: string;
  download?: string;
  skip?: AnimeKaiSourceSkip;
  sources?: AnimeKaiSourceItem[];
  tracks?: AnimeKaiTrackItem[];
}
