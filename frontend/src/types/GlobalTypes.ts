export interface Episodes {
  sub?: number;
  dub?: number;
}

export interface RankedAnime {
  episodes?: Episodes;
  id: string;
  name: string;
  poster: string;
  rank?: number;
}

export interface TimeRankedAnime {
  today: RankedAnime[];
  week: RankedAnime[];
  month: RankedAnime[];
}

export interface AnimeBase {
  id: string;
  name: string;
  type: string;
  poster: string;
  duration: string;
  jname?: string;
  description?: string;
  rank?: number;
  otherInfo?: string[];
  episodes?: Episodes;
  rating?: string;
}
