import { publicEnv } from '@/lib/env.public';
import { ApiError } from '@/lib/errors/ApiError';

function getAnimeKaiBaseUrl(): string {
  return publicEnv.NEXT_PUBLIC_ANIMEKAI_API_URL;
}

export const animekaiApi = {
  get: async <T = unknown>(
    path: string,
    revalidate?: number,
    signal?: AbortSignal
  ): Promise<T> => {
    const base = getAnimeKaiBaseUrl();
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

    /** У браузері `next.revalidate` не застосовується — лише зайве; завжди no-store. */
    const isBrowser = typeof window !== 'undefined';
    const cacheInit =
      !isBrowser && typeof revalidate === 'number'
        ? { next: { revalidate } }
        : { cache: 'no-store' as RequestCache };

    const res = await fetch(url, {
      ...cacheInit,
      signal,
    });

    const bodyText = await res.text();

    if (!res.ok) {
      let message = `AnimeKai API failed (${res.status})`;
      const trimmed = bodyText.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed) as {
            error?: string;
            details?: string;
          };
          if (typeof parsed.error === 'string' && parsed.error.trim()) {
            message = parsed.error.trim();
            if (typeof parsed.details === 'string' && parsed.details.trim()) {
              message = `${message}: ${parsed.details.trim()}`;
            }
          }
        } catch {
          /* noop */
        }
      }
      throw new ApiError(message, res.status);
    }

    const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
    const likelyJson =
      contentType.includes('application/json') ||
      bodyText.trim().startsWith('{') ||
      bodyText.trim().startsWith('[');

    if (!likelyJson) {
      throw new ApiError(`AnimeKai returned non-JSON for ${path}`, 502);
    }

    try {
      return JSON.parse(bodyText) as T;
    } catch {
      throw new ApiError(`Invalid JSON from AnimeKai for ${path}`, 502);
    }
  },
};
