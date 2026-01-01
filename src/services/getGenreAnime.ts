import { ApiError } from '@/lib/errors/ApiError';

export const getGenreAnime = async (
  name: string = 'most-popular',
  page: number = 1
) => {
  const res = await fetch(
    `https://anime-api-nu-ten.vercel.app/api/genre/${name}?page=${page}`
  );

  if (!res.ok) {
    throw new ApiError('Failed to load Genres', res.status);
  }
  const data = res.json();

  return data;
};
