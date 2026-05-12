import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export interface SwiperCardProps {
  title?: string;
  catalog: AnimeInfo[];
  sectionId?: string;
}
