import { apiUrl, type ApiResponse } from '@/lib/api';

export interface NextEpisodeScheduleResult {
  nextEpisodeSchedule: string;
}

const getNextEpisodeSchedule = async (
  id: string
): Promise<NextEpisodeScheduleResult> => {
  const data = await apiUrl.get<ApiResponse<NextEpisodeScheduleResult>>(
    `/schedule/${id}`
  );
  return data.results;
};

export default getNextEpisodeSchedule;
