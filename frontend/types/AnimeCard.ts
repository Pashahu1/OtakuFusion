import { Episodes } from './HomePageTypes';

export interface AnimeCard {
  id?: string;
  name?: string;
  jname?: string;
  poster?: string;
  description?: string;
  rank?: number;
  otherInfo?: string[];
  episodes?: Episodes;
}
