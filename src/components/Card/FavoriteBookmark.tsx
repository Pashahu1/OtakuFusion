'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { addFavoriteAnime, removeFavoriteAnime } from '@/lib/api/favorites';
import { useFavoritesQuery } from '@/hooks/useFavorites';
import { queryKeys } from '@/lib/query/keys';
import { toast } from '@/lib/toast';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { cn } from '@/lib/utils';

interface FavoriteBookmarkProps {
  anime: AnimeInfo;
  iconClassName?: string;
  buttonClassName?: string;
  variant?: 'default' | 'square';
}

export function FavoriteBookmark({
  anime,
  iconClassName,
  buttonClassName,
  variant = 'default',
}: FavoriteBookmarkProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useFavoritesQuery(Boolean(user));

  const isFavorite = favorites.some((item) => item.id === anime.id);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) await removeFavoriteAnime(anime.id);
      else await addFavoriteAnime(anime.id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      const previousFavorites = queryClient.getQueryData<AnimeInfo[]>(queryKeys.favorites) ?? [];
      const nextFavorites = isFavorite
        ? previousFavorites.filter((item) => item.id !== anime.id)
        : [anime, ...previousFavorites.filter((item) => item.id !== anime.id)];
      queryClient.setQueryData<AnimeInfo[]>(queryKeys.favorites, nextFavorites);
      return { previousFavorites };
    },
    onError: (err: Error, _variables, context) => {
      if (context) {
        queryClient.setQueryData<AnimeInfo[]>(
          queryKeys.favorites,
          context.previousFavorites,
        );
      }
      const msg =
        err.message === 'Unauthorized'
          ? 'Sign in to save favorites.'
          : err.message || 'Could not update favorites.';
      toast.error(msg);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });

  const isSquare = variant === 'square';

  return (
    <button
      type="button"
      className={cn(
        'pointer-events-auto focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)] focus-visible:outline-none disabled:opacity-50',
        isSquare
          ? cn(buttonClassName, isFavorite && `${buttonClassName}--active`)
          : cn(
              'rounded-md p-0.5',
              iconClassName,
            ),
      )}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remove from watchlist' : 'Save to watchlist'}
      disabled={mutation.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          toast('Sign in to save favorites.');
          return;
        }
        mutation.mutate();
      }}
    >
      <Bookmark
        className={cn(
          isSquare ? iconClassName : iconClassName,
          !isSquare && isFavorite && 'fill-[var(--color-brand-orange)]',
        )}
        strokeWidth={isSquare ? 1.75 : 2}
        fill={isFavorite ? 'currentColor' : 'none'}
        aria-hidden
      />
    </button>
  );
}
