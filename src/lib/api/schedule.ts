import {
  getAniListMediaById,
  getAniListScheduleByDate,
  mapAniListMediaToNextEpisodeSchedule,
} from '@/lib/anilist';
import type {
  NextEpisodeScheduleResult,
  ScheduleAnime,
} from '@/shared/types/GlobalAnimeTypes';

export const getNextEpisodesAnime = async (
  date: string
): Promise<ScheduleAnime[]> => {
  return getAniListScheduleByDate(date);
};

export async function getNextEpisodeSchedule(
  id: string
): Promise<NextEpisodeScheduleResult> {
  const media = await getAniListMediaById(id);
  return mapAniListMediaToNextEpisodeSchedule(media);
}
