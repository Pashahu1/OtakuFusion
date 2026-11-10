import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';

export async function fetchContinueWatching(): Promise<ContinueWatchingEntry[] | null> {
  const res = await fetchWithRefresh('/api/continue-watching', {
    credentials: 'include',
  });
  if (res.status === 401) return null;
  if (!res.ok) return [];
  const data = (await res.json()) as { entries?: ContinueWatchingEntry[] };
  return Array.isArray(data.entries) ? data.entries : [];
}

export async function upsertContinueWatchingEntry(
  entry: ContinueWatchingEntry,
): Promise<boolean> {
  const res = await fetchWithRefresh('/api/continue-watching', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ entry }),
  });
  return res.ok;
}

export async function replaceContinueWatchingList(
  entries: ContinueWatchingEntry[],
): Promise<boolean> {
  const res = await fetchWithRefresh('/api/continue-watching', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ entries }),
  });
  return res.ok;
}

export async function deleteContinueWatchingEntry(
  animeId: string,
): Promise<boolean> {
  const res = await fetchWithRefresh(
    `/api/continue-watching?animeId=${encodeURIComponent(animeId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );
  return res.ok || res.status === 401;
}
