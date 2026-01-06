export interface AnimePlayerType {
  [x: string]: any;
  headers: {
    Referer: string;
  };
  tracks: Track[];
  intro?: Segment;
  outro?: Segment;
  sources: Source[];
  anilistID: number;
  malID: number;
}

export type Track = {
  file: string;
  kind: "thumbnails" | string;
};

export type Segment = {
  start: number;
  end: number;
};

export type Source = {
  url: string;
  type: "hls" | "mp4" | string;
};
