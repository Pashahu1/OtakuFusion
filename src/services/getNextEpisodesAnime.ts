import { apiUrl } from '@/lib/api';

export const getNextEpisodesAnime = async (date: string) => {
  const data = await apiUrl.get(`/schedule?date=${date}`);

  return data.results;
};
