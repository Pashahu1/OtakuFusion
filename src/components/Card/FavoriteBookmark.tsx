'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  addFavoriteAnime,
  favoritesQueryKey,
  fetchFavorites,
  removeFavoriteAnime,
} from '@/lib/api/favorites';
import { toast } from '@/lib/toast';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { cn } from '@/lib/utils';

interface FavoriteBookmarkProps {
  anime: AnimeInfo;
  iconClassName?: string;
}

export function FavoriteBookmark({ anime, iconClassName }: FavoriteBookmarkProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: fetchFavorites,
    enabled: Boolean(user),
  });

  const isFavorite = favorites.some((item) => item.id === anime.id);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) await removeFavoriteAnime(anime.id);
      else await addFavoriteAnime(anime.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
    onError: (err: Error) => {
      const msg =
        err.message === 'Unauthorized'
          ? 'Sign in to save favorites.'
          : err.message || 'Could not update favorites.';
      toast.error(msg);
    },
  });

  return (
    <button
      type="button"
      className={cn(
        'pointer-events-auto rounded-md p-0.5 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)] focus-visible:outline-none disabled:opacity-50',
        iconClassName,
      )}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
          iconClassName,
          isFavorite && 'fill-[var(--color-brand-orange)]',
        )}
        strokeWidth={2}
        fill={isFavorite ? 'currentColor' : 'none'}
        aria-hidden
      />
    </button>
  );
}
