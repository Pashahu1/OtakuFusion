import { apiUrl, type ApiResponse } from '@/lib/api';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

export default async function getServers(
  animeId: string,
  episodeId: string,
  signal?: AbortSignal
): Promise<ServerInfo[]> {
  const data = await apiUrl.get<ApiResponse<ServerInfo[]>>(
    `/servers/${animeId}?ep=${episodeId}`,
    undefined,
    signal
  );
  return data.results;
}
