export interface AnimeInfo {
  id: string;
  name: string;
  poster: string;
  description: string;
  stats: {
    rating: string;
    quality: string;
    episodes: {
      sub: number;
      dub: number;
    };
    type: string;
    duration: string;
  };
  promotionalVideos: Array<{
    title: string | undefined;
    source: string | undefined;
    thumbnail: string | undefined;
  }>;
  characterVoiceActor: Array<{
    character: {
      id: string;
      poster: string;
      name: string;
      cast: string;
    };
    voiceActor: {
      id: string;
      poster: string;
      name: string;
      cast: string;
    };
  }>;
}

export interface AnimeMoreInfo {
  aired: string;
  genres: string[];
  status: string;
  studios: string;
  duration: string;
}

export interface Anime {
  info: AnimeInfo;
  moreInfo: AnimeMoreInfo;
}

export interface AnimeResponse {
  data: {
    anime: Anime[];
    mostPopularAnimes: Array<{
      episodes: {
        sub: number;
        dub: number;
      };
      id: string;
      jname: string;
      name: string;
      poster: string;
      type: string;
    }>;
    recommendedAnimes: Array<{
      id: string;
      name: string;
      poster: string;
      duration: string;
      type: string;
      rating: string;
      episodes: {
        sub: number;
        dub: number;
      };
    }>;
    relatedAnimes: Array<{
      id: string;
      name: string;
      poster: string;
      duration: string;
      type: string;
      rating: string;
      episodes: {
        sub: number;
        dub: number;
      };
    }>;
    seasons: Array<{
      id: string;
      name: string;
      title: string;
      poster: string;
      isCurrent: boolean;
    }>;
  };
}
