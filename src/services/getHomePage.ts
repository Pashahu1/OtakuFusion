import { apiUrl } from '@/lib/api';
import type { HomePageResponse } from '@/shared/types/HomePageTypes';

export const getHomePage = async (): Promise<HomePageResponse['results']> => {
  const data = await apiUrl.get<HomePageResponse>('/', 3600);
  return data.results;
};
