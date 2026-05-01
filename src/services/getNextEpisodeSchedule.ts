import {
  getAniListMediaById,
  mapAniListMediaToNextEpisodeSchedule,
} from '@/lib/anilist';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

export async function getNextEpisodeSchedule(
  id: string
): Promise<NextEpisodeScheduleResult> {
  const media = await getAniListMediaById(id);
  return mapAniListMediaToNextEpisodeSchedule(media);
}
