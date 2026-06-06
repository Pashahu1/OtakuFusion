import type { AnikotoEpisodeRow } from '@/server/anikoto/types';

export interface AnikotoEpisodesBffOk {
  success: true;
  data: AnikotoEpisodeRow[];
}

export interface AnikotoEpisodesBffErr {
  success: false;
  error: string;
}

export async function getAnikotoEpisodesBff(
  slug: string,
  signal?: AbortSignal,
): Promise<AnikotoEpisodesBffOk | AnikotoEpisodesBffErr> {
  const id = slug.trim();
  if (!id) return { success: false, error: 'anikoto_episodes_slug_required' };

  const res = await fetch(`/api/anikoto/episodes?id=${encodeURIComponent(id)}`, {
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
    return { success: false, error: 'anikoto_episodes_invalid_json' };
  }
  if (!json || typeof json !== 'object') {
    return { success: false, error: 'anikoto_episodes_empty' };
  }
  const envelope = json as { success?: boolean; data?: AnikotoEpisodeRow[]; error?: string };
  if (!res.ok || envelope.success !== true || !Array.isArray(envelope.data)) {
    const err =
      typeof envelope.error === 'string' && envelope.error.trim()
        ? envelope.error.trim()
        : `anikoto_episodes_${res.status}`;
    return { success: false, error: err };
  }
  return { success: true, data: envelope.data };
}
