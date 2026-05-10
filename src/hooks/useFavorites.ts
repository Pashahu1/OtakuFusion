'use client';

import { useQuery } from '@tanstack/react-query';
import { favoritesQueryKey, fetchFavorites } from '@/lib/api/favorites';

export function useFavoritesQuery(enabled: boolean) {
  return useQuery({
    queryKey: favoritesQueryKey,
    queryFn: fetchFavorites,
    enabled,
  });
}
