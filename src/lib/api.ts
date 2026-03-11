import { ApiError } from './errors/ApiError';

export interface ApiResponse<T> {
  results: T;
}

export const apiUrl = {
  get: async <T = unknown>(
    endpoint: string,
    revalidate?: number,
    signal?: AbortSignal
  ): Promise<T> => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('url is not set');
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      next: revalidate ? { revalidate } : undefined,
      signal,
    });

    if (!res.ok) {
      throw new ApiError('API request failed', res.status);
    }

    return res.json() as Promise<T>;
  },
};
