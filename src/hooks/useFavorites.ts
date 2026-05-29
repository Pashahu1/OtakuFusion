'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchFavorites } from '@/lib/api/favorites';
import { queryKeys } from '@/lib/query/keys';
import { STALE_TIME } from '@/lib/query/stale-time';

export function useFavoritesQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: fetchFavorites,
    enabled,
    staleTime: STALE_TIME.favorites,
  });
}

/** Same key as `FavoriteBookmark` — one request shared by all subscribers. */
export function useIsFavoriteAnime(animeId: string) {
  const { user } = useAuth();
  const { data: favorites = [] } = useFavoritesQuery(Boolean(user));
  return favorites.some((item) => item.id === animeId);
}
