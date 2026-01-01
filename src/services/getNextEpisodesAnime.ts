import { ApiError } from '@/lib/errors/ApiError';

export const getNextEpisodesAnime = async (date: string) => {
  const res = await fetch(
    `https://anime-api-nu-ten.vercel.app/api/schedule?date=${date}`
  );
  if (!res.ok) {
    throw new ApiError('Failed to get New Episodes', res.status);
  }
  const data = await res.json();

  return data.results;
};
