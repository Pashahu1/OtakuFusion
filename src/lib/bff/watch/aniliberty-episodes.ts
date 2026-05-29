import type { GetEpisodesResult } from '@/shared/types/EpisodesListTypes';

export async function getAnilibertyEpisodesFromBff(
  releaseId: string,
  signal?: AbortSignal
): Promise<GetEpisodesResult> {
  const trimmed = releaseId.trim();
  if (!trimmed) {
    return { episodes: [], totalEpisodes: 0 };
  }

  const q = new URLSearchParams();
  q.set('release_id', trimmed);

  const res = await fetch(`/api/aniliberty/episodes?${q.toString()}`, {
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
    throw new Error('aniliberty_episodes_invalid_json');
  }

  if (!res.ok) {
    const err =
      json && typeof json === 'object' && typeof (json as { error?: unknown }).error === 'string'
        ? (json as { error: string }).error
        : `aniliberty_episodes_${res.status}`;
    throw new Error(err);
  }

  if (!json || typeof json !== 'object') {
    throw new Error('aniliberty_episodes_empty');
  }

  return json as GetEpisodesResult;
}
