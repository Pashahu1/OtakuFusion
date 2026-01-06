import { apiUrl } from '@/lib/api';

export const getAnimeSearch = async (query: string) => {
  const data = await apiUrl.get(`/search?keyword=${query}`);
  return data.results;
};
