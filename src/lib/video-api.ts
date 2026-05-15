import { ApiError } from '@/lib/errors/ApiError';
import { getPublicAppOrigin } from '@/lib/public-app-origin';

export interface VideoApiResponse<T> {
  results: T;
}

function getVideoApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_STREAM_API_URL;
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t) return t.replace(/\/+$/, '');
  }
  return getPublicAppOrigin();
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

    const bodyText = await res.text();

    if (!res.ok) {
      let message = `Video API request failed (${res.status})`;
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
          /* залишаємо дефолтне повідомлення */
        }
      }
      throw new ApiError(message, res.status);
    }

    const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
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
