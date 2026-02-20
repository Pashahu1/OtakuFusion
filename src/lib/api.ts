import { ApiError } from './errors/ApiError';

const API_URL = 'https://anime-api-8ckpoa.fly.dev/api';

export const apiUrl = {
  get: async (endpoint: string, revalidate?: number) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: revalidate ? { revalidate } : undefined,
    });

    if (!res.ok) {
      throw new ApiError('API request failed', res.status);
    }

    return res.json();
  },
};
