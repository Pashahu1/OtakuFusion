import { publicEnv } from '@/lib/env.public';
import { ApiError } from '@/lib/errors/ApiError';

export interface VideoApiResponse<T> {
  results: T;
}

function getVideoApiBaseUrl(): string {
  return publicEnv.NEXT_PUBLIC_STREAM_API_URL || publicEnv.NEXT_PUBLIC_API_URL;
}

export const videoApiUrl = {
  get: async <T = unknown>(
    endpoint: string,
    revalidate?: number,
    signal?: AbortSignal
  ): Promise<T> => {
    const url = `${getVideoApiBaseUrl()}${endpoint}`;
    const res = await fetch(url, {
      ...(typeof revalidate === 'number'
        ? { next: { revalidate } }
        : { cache: 'no-store' as RequestCache }),
      signal,
    });

    if (!res.ok) {
      throw new ApiError(`Video API request failed (${res.status})`, res.status);
    }

    const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
    const bodyText = await res.text();
    const likelyJson =
      contentType.includes('application/json') ||
      contentType.includes('application/problem+json') ||
      bodyText.trim().startsWith('{') ||
      bodyText.trim().startsWith('[');

    if (!likelyJson) {
      throw new ApiError(`Video API returned non-JSON for ${endpoint}`, 502);
    }

    try {
      return JSON.parse(bodyText) as T;
    } catch {
      throw new ApiError(`Invalid JSON from Video API for ${endpoint}`, 502);
    }
  },
};
