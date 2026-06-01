import { ApiError } from '@/lib/errors/ApiError';

import type { AniListResponse } from './types';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';

/** In browser AniList blocks CORS for third-party origins — use `/api/anilist/graphql`. */
function getAnilistGraphqlFetchUrl(): string {
  if (typeof window !== 'undefined') {
    return '/api/anilist/graphql';
  }
  return ANILIST_GRAPHQL_URL;
}

async function anilistRequestOnce<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const url = getAnilistGraphqlFetchUrl();
  const isBrowser = typeof window !== 'undefined';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    ...(isBrowser ? {} : { next: { revalidate: 900 } }),
  });

  if (!response.ok) {
    throw new ApiError('AniList request failed', response.status);
  }

  const payload = (await response.json()) as AniListResponse<TData>;
  if (payload.errors?.length) {
    const message = payload.errors[0]?.message || 'AniList GraphQL error';
    throw new ApiError(message, 502);
  }
  if (!payload.data) {
    throw new ApiError('AniList returned empty payload', 502);
  }

  return payload.data;
}

function anilistRetryDelayMs(status: number, attempt: number): number {
  if (status === 429) return 1200 + attempt * 800;
  return 0;
}

export async function anilistRequest<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await anilistRequestOnce<TData>(query, variables);
    } catch (err) {
      lastError = err;
      const status = err instanceof ApiError ? err.status : 0;
      const delayMs = anilistRetryDelayMs(status, attempt);
      if (delayMs <= 0 || attempt >= maxAttempts - 1) break;
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
  }

  throw lastError;
}
