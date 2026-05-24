import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export async function getAnimexEpisodesFromBff(
  animexId: string,
  signal?: AbortSignal
): Promise<GetEpisodesResult> {
  const trimmed = animexId.trim();
  if (!trimmed) {
    return { episodes: [], totalEpisodes: 0 };
  }

  const q = new URLSearchParams();
  q.set('animex_id', trimmed);

  const res = await fetch(`/api/animex/episodes?${q.toString()}`, {
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
    throw new Error('animex_episodes_invalid_json');
  }

  if (!res.ok) {
    const err =
      json && typeof json === 'object' && typeof (json as { error?: unknown }).error === 'string'
        ? (json as { error: string }).error
        : `animex_episodes_${res.status}`;
    throw new Error(err);
  }

  if (!json || typeof json !== 'object') {
    throw new Error('animex_episodes_empty');
  }

  return json as GetEpisodesResult;
}
