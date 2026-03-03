import { apiUrl, type ApiResponse } from '@/lib/api';
import type { ScheduleAnime } from '@/shared/types/GlobalAnimeTypes';

export const getNextEpisodesAnime = async (
  date: string
): Promise<ScheduleAnime[]> => {
  const data = await apiUrl.get<ApiResponse<ScheduleAnime[]>>(
    `/schedule?date=${date}`
  );
  return data.results;
};
