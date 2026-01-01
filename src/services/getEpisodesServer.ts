import { ApiError } from '@/lib/errors/ApiError';

export const getEpisodesServer = async (id: string) => {
  const res = await fetch(
    `https://anime-api-nu-ten.vercel.app/api/servers/${id}`
  );

  if (!res.ok) {
    throw new ApiError('Failed to load Episodes', res.status);
  }

  const data = res.json();

  return data;
};
