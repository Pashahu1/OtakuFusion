export interface EpisodesTypes {
  episode_no: number;
  id: string;
  data_id: number;
  jname: string;
  title: string;
  japanese_title: string;
  filler?: boolean;
  /** Internal episode id at provider (hash / slug). */
  ep_token?: string;
  variant?: string;
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface GetEpisodesResult {
  episodes: EpisodesTypes[];
  totalEpisodes: number;
}
