import { apiUrl, type ApiResponse } from '@/lib/api';
import type { AnimeResults } from '@/shared/types/animeDetailsTypes';

export async function getAnimeInfo(
  id: string
): Promise<AnimeResults> {
  const data = await apiUrl.get<ApiResponse<AnimeResults>>(`/info?id=${id}`);
  return data.results;
}
