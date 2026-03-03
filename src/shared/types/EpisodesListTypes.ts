export interface EpisodesTypes {
  episode_no: number;
  id: string;
  data_id: number;
  jname: string;
  title: string;
  japanese_title: string;
  filler?: boolean;
}

export interface GetEpisodesResult {
  episodes: EpisodesTypes[];
  totalEpisodes: number;
}
