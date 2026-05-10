'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { favoritesQueryKey, fetchFavorites } from '@/lib/api/favorites';

export function useFavoritesQuery(enabled: boolean) {
  return useQuery({
    queryKey: favoritesQueryKey,
    queryFn: fetchFavorites,
    enabled,
  });
}

/** Same query key as `FavoriteBookmark`; React Query serves one cached request. */
export function useIsFavoriteAnime(animeId: string) {
  const { user } = useAuth();
  const { data: favorites = [] } = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: fetchFavorites,
    enabled: Boolean(user),
  });
  return favorites.some((item) => item.id === animeId);
}
