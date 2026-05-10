import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export const favoritesQueryKey = ['favorites'] as const;

export async function fetchFavorites(): Promise<AnimeInfo[]> {
  const res = await fetchWithRefresh('/api/favorites', { credentials: 'include' });
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(typeof data.message === 'string' ? data.message : 'Failed to load favorites.');
  }
  const data = (await res.json()) as { favorites?: AnimeInfo[] };
  return Array.isArray(data.favorites) ? data.favorites : [];
}

export async function addFavoriteAnime(animeId: string): Promise<void> {
  const res = await fetchWithRefresh('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ animeId }),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(typeof data.message === 'string' ? data.message : 'Could not add favorite.');
  }
}

export async function removeFavoriteAnime(animeId: string): Promise<void> {
  const res = await fetchWithRefresh(
    `/api/favorites?animeId=${encodeURIComponent(animeId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(typeof data.message === 'string' ? data.message : 'Could not remove favorite.');
  }
}
