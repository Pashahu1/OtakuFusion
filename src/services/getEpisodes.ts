import { apiUrl, type ApiResponse } from '@/lib/api';
import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export async function getEpisodes(
  id: string
): Promise<GetEpisodesResult> {
  const data = await apiUrl.get<ApiResponse<GetEpisodesResult>>(
    `/episodes/${id}`
  );
  return data.results;
}
