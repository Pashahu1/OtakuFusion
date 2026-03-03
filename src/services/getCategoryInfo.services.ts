import { apiUrl, type ApiResponse } from '@/lib/api';

const getCategoryInfo = async (
  path: string,
  page: string
): Promise<ApiResponse<unknown>> => {
  const data = await apiUrl.get<ApiResponse<unknown>>(
    `/${path}?page=${page}`
  );
  return data;
};

export default getCategoryInfo;
