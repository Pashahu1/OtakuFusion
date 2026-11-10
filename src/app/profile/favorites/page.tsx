'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/Card/Card';
import { withNextQuery } from '@/features/auth/lib/safe-next-path';
import {
  ANIME_CAROUSEL_POSTER_SIZES,
  ABOVE_THE_FOLD_CARD_COUNT,
  ANIME_GRID_POSTER_QUALITY,
} from '@/lib/anime-card-poster';
import '@/components/Layout/anime-card-feed.scss';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesQuery } from '@/hooks/useFavorites';

export default function FavoritesPage() {
  const { t } = useTranslation('common');
  const { user, isLoading: authLoading } = useAuth();
  const {
    data: favorites = [],
    isLoading: favoritesLoading,
    isError,
    error,
  } = useFavoritesQuery(Boolean(user));

  if (authLoading) {
    return <InitialLoader />;
  }

  if (!user) {
    return (
      <div className="w-full space-y-4 text-center">
        <h1 className="text-title text-brand-text-primary">{t('profile.favorites')}</h1>
        <p className="text-sm text-[var(--color-brand-text-muted)]">
          {t('profile.favoritesSignIn')}
        </p>
        <Link href={withNextQuery('/auth/login', '/profile/favorites')} className="hero-cta">
          {t('auth.logIn')}
        </Link>
      </div>
    );
  }

  if (favoritesLoading) {
    return <InitialLoader />;
  }

  if (isError) {
    return (
      <div className="w-full space-y-2 text-center">
        <h1 className="text-title text-brand-text-primary">{t('profile.favorites')}</h1>
        <p className="text-sm text-red-400">
          {error instanceof Error ? error.message : t('profile.favoritesLoadError')}
        </p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        title={t('profile.favoritesEmptyTitle')}
        message={t('profile.favoritesEmpty')}
        surface="panel"
      />
    );
  }

  return (
    <section className="w-full space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-title text-brand-text-primary">{t('profile.favorites')}</h1>
        <p className="mt-1 text-sm text-[var(--color-brand-text-muted)]">
          {t('profile.savedTitle', { count: favorites.length })}
        </p>
      </div>
      <div className="anime-card-feed">
        {favorites.map((anime, index) => (
          <Card
            key={anime.id}
            anime={anime}
            posterSizes={ANIME_CAROUSEL_POSTER_SIZES}
            posterQuality={ANIME_GRID_POSTER_QUALITY}
            priority={index < ABOVE_THE_FOLD_CARD_COUNT}
          />
        ))}
      </div>
    </section>
  );
}
