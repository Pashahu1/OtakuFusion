import type { AnimeInfo } from "./GlobalAnimeTypes";

export interface SwiperCardProps {
  title?: string;
  catalog: AnimeInfo[];
  sectionId?: string;
}