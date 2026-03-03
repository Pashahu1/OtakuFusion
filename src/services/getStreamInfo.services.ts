import { apiUrl, type ApiResponse } from '@/lib/api';
import type { StreamingData } from '@/shared/types/StreamingTypes';

export default async function getStreamInfo(
  animeId: string,
  episodeId: string,
  serverName: string,
  type: string
): Promise<StreamingData> {
  const data = await apiUrl.get<ApiResponse<StreamingData>>(
    `/stream?id=${animeId}?ep=${episodeId}&server=${serverName}&type=${type}`
  );
  return data.results;
}
