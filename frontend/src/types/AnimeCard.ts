import { Episodes } from "./GlobalTypes";

export interface AnimeCard {
  id?: string;
  name?: string;
  jname?: string;
  poster?: string;
  description?: string;
  rank?: number;
  otherInfo?: string[];
  episodes?: Episodes;
  episodeId?: string;
}
