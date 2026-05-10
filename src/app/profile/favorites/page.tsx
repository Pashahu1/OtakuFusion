'use client';

import Link from 'next/link';
import { Card } from '@/components/Card/Card';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesQuery } from '@/hooks/useFavorites';

export default function FavoritesPage() {
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
        <h1 className="text-title text-brand-text-primary">Favorites</h1>
        <p className="text-sm text-[var(--color-brand-text-muted)]">
          Sign in to save and view your favorite anime.
        </p>
        <Link
          href="/login"
          className="inline-flex rounded-md bg-[var(--color-brand-orange)] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Log in
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
        <h1 className="text-title text-brand-text-primary">Favorites</h1>
        <p className="text-sm text-red-400">
          {error instanceof Error ? error.message : 'Could not load favorites.'}
        </p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        message="Use the bookmark on a card to add anime here."
        fullPage={false}
      />
    );
  }

  return (
    <section className="w-full space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-title text-brand-text-primary">Favorites</h1>
        <p className="mt-1 text-sm text-[var(--color-brand-text-muted)]">
          {favorites.length} saved {favorites.length === 1 ? 'title' : 'titles'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4 md:gap-5">
        {favorites.map((anime) => (
          <Card key={anime.id} anime={anime} />
        ))}
      </div>
    </section>
  );
}
