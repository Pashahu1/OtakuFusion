import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

/**
 * Список епізодів AnimeKai через власний BFF (кеш на сервері, без прямого виклику AnimeKai з браузера).
 */
export async function getKaiEpisodesFromBff(
  aniId: string,
  signal?: AbortSignal
): Promise<GetEpisodesResult> {
  const trimmed = aniId.trim();
  if (!trimmed) {
    return { episodes: [], totalEpisodes: 0 };
  }

  const q = new URLSearchParams();
  q.set('ani_id', trimmed);

  const res = await fetch(`/api/kai/episodes?${q.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    signal,
    headers: { accept: 'application/json' },
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text.trim() ? JSON.parse(text) : null;
  } catch {
    throw new Error('kai_episodes_invalid_json');
  }

  if (!res.ok) {
    const err =
      json && typeof json === 'object' && typeof (json as { error?: unknown }).error === 'string'
        ? (json as { error: string }).error
        : `kai_episodes_${res.status}`;
    throw new Error(err);
  }

  if (!json || typeof json !== 'object') {
    throw new Error('kai_episodes_empty');
  }

  return json as GetEpisodesResult;
}
