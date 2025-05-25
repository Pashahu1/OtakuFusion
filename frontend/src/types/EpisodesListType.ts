export interface EpisodesListType {
  totalEpisodes: number;
  episodes: EpisodesType[][];
  selectedEpisodeId: string | null;
}

export interface EpisodesType {
  number: number;
  title: string;
  episodeId: string;
  isFiller: boolean;
}
