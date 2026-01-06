import { apiUrl } from '@/lib/api';

export const getGenreAnime = async (
  name: string = 'most-popular',
  page: number = 1
) => {
  const data = apiUrl.get(`/genre/${name}?page=${page}`);
  return data;
};
