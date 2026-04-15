import { apiUrl } from '@/lib/api';
import { ApiError } from '@/lib/errors/ApiError';
import type { HomePageResponse } from '@/shared/types/HomePageTypes';

export const getHomePage = async (): Promise<
  HomePageResponse['results'] | null
> => {
  try {
    const data = await apiUrl.get<HomePageResponse>('/', 3600);
    return data.results;
  } catch (err) {
    if (err instanceof ApiError) {
      console.error('[getHomePage] API failed:', err.status, err.message);
    } else {
      console.error('[getHomePage]', err);
    }
    return null;
  }
};
