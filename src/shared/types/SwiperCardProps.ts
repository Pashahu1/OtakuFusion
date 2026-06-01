import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export interface SwiperCardProps {
  title?: string;
  catalog: AnimeInfo[];
  sectionId?: string;
  viewAllHref?: string;
  /** Leading slides with fetch priority — use only on the first carousel above the fold. */
  prioritySlideCount?: number;
}
