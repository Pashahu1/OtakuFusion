import { getAniListScheduleByDate } from '@/lib/anilist';
import type { ScheduleAnime } from '@/shared/types/GlobalAnimeTypes';

export const getNextEpisodesAnime = async (
  date: string,
): Promise<ScheduleAnime[]> => {
  return getAniListScheduleByDate(date);
};
