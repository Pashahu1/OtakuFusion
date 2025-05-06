import { AnimeCard } from './AnimeCard';

export interface AzLitsTypes {
  sortOption: '0-9';
  animes: AnimeCard[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}
