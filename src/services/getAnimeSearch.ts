import { ApiError } from '@/lib/errors/ApiError';

export const getAnimeSearch = async (query: string) => {
  const api_url = 'https://anime-api-nu-ten.vercel.app/api';
  const res = await fetch(`${api_url}/search?keyword=${query}`);
  if (!res.ok) {
    throw new ApiError('Failed to search Anime', res.status);
  }
  const data = await res.json();
  return data.results;
};
