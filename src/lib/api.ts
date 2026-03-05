import { ApiError } from './errors/ApiError';

const API_URL = 'https://anime-api-8ckpoa.fly.dev/api';

export interface ApiResponse<T> {
  results: T;
}

export const apiUrl = {
  get: async <T = unknown>(
    endpoint: string,
    revalidate?: number
  ): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: revalidate ? { revalidate } : undefined,
    });

    if (!res.ok) {
      throw new ApiError('API request failed', res.status);
    }

    return res.json() as Promise<T>;
  },
};
