import { getCategory, type CategoryResults } from '@/services/getCategory';
import type { ApiResponse } from '@/lib/api';

export async function getCategoryInfo(
  path: string,
  page: string
): Promise<ApiResponse<CategoryResults>> {
  return getCategory(path, Number(page));
}
