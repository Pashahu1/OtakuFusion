import { apiUrl, type ApiResponse } from '@/lib/api';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';

export async function getNextEpisodeSchedule(
  id: string
): Promise<NextEpisodeScheduleResult> {
  const data = await apiUrl.get<
    ApiResponse<NextEpisodeScheduleResult | string>
  >(`/schedule/${id}`);
  const raw = data.results;
  if (typeof raw === 'string') {
    return { nextEpisodeSchedule: raw };
  }
  if (raw && typeof raw === 'object' && 'nextEpisodeSchedule' in raw) {
    return raw as NextEpisodeScheduleResult;
  }
  return { nextEpisodeSchedule: '' };
}
