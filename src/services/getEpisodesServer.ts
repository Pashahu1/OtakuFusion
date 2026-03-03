import { apiUrl, type ApiResponse } from '@/lib/api';
import type { StreamServer } from '@/shared/types/StreamingTypes';

export const getEpisodesServer = async (
  id: string
): Promise<StreamServer[]> => {
  const data = await apiUrl.get<ApiResponse<StreamServer[]>>(`/servers/${id}`);
  return data.results;
};
