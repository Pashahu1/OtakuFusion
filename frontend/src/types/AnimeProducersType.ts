import { AnimeBase, RankedAnime, TimeRankedAnime } from "./GlobalTypes";

export interface AnimeProducersType {
  producerName: string;
  animes: AnimeBase[];
  top10Animes: RankedAnime[];
  topAiringAnimes: TimeRankedAnime[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}
