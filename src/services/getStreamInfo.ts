import { apiUrl, type ApiResponse } from '@/lib/api';
import type { StreamingData } from '@/shared/types/StreamingTypes';

export async function getStreamInfo(
  animeId: string,
  episodeId: string,
  serverName: string,
  type: string,
  signal?: AbortSignal
): Promise<StreamingData> {
  const data = await apiUrl.get<ApiResponse<StreamingData>>(
    `/stream/fallback?id=${animeId}?ep=${episodeId}&server=${serverName}&type=${type}`,
    undefined,
    signal
  );
  return data.results;
}
