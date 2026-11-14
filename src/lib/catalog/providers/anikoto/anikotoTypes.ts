export interface AnikotoSearchHit {
  id: string;
  title: string;
  type?: string;
  sub?: string | number | null;
  dub?: string | number | null;
  episodes?: string | number | null;
}

export interface AnikotoMatchHints {
  episodeCount?: number | null;
  format?: string | null;
}

export interface AnikotoSubtitleTrack {
  file: string;
  label: string;
  kind: string;
  default?: boolean;
}

export interface AnikotoMappedStream {
  url: string;
  referer: string;
  tracks: AnikotoSubtitleTrack[];
  intro: { start: number; end: number } | null;
  outro: { start: number; end: number } | null;
}
