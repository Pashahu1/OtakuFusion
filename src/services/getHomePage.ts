import { ApiError } from '@/lib/errors/ApiError';

export const getHomePage = async () => {
  const res = await fetch('https://anime-api-nu-ten.vercel.app/api/', {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new ApiError('Failed to load HomePage', res.status);
  }
  const data = await res.json();

  return data.results;
};
