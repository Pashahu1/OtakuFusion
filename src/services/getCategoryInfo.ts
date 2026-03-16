import { apiUrl, type ApiResponse } from '@/lib/api';

export async function getCategoryInfo(
  path: string,
  page: string
): Promise<ApiResponse<unknown>> {
  const data = await apiUrl.get<ApiResponse<unknown>>(
    `/${path}?page=${page}`
  );
  return data;
}
