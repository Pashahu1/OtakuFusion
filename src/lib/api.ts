import { ApiError } from './errors/ApiError';
import { getPublicAppOrigin } from '@/lib/public-app-origin';
export interface ApiResponse<T> {
  results: T;
}

export const apiUrl = {
  get: async <T = unknown>(
    endpoint: string,
    revalidate?: number,
    signal?: AbortSignal
  ): Promise<T> => {
    const base = getPublicAppOrigin();
    const url =
      endpoint.startsWith('http://') || endpoint.startsWith('https://')
        ? endpoint
        : `${base}${endpoint}`;
    const res = await fetch(url, {
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
