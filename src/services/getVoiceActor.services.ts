import { apiUrl, type ApiResponse } from '@/lib/api';

export default async function fetchVoiceActorInfo(
  id: string,
  page: string
): Promise<unknown> {
  const data = await apiUrl.get<ApiResponse<unknown>>(
    `/character/list/${id}?page=${page}`
  );
  return data.results;
}
