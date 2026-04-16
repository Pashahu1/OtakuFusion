import { ApiError } from './errors/ApiError';
import { publicEnv } from '@/lib/env.public';
export interface ApiResponse<T> {
  results: T;
}

export const apiUrl = {
  get: async <T = unknown>(
    endpoint: string,
    revalidate?: number,
    signal?: AbortSignal
  ): Promise<T> => {
    const res = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...(typeof revalidate === 'number'
        ? { next: { revalidate } }
        : { cache: 'no-store' as RequestCache }),
      signal,
    });

    if (!res.ok) {
      throw new ApiError('API request failed', res.status);
    }

    return res.json() as Promise<T>;
  },
};
