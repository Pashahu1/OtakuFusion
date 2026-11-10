'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { genres } from '@/shared/data/genres';
import { localizeGenreName } from '@/i18n/localize-genre';
import { genreToSlug } from '@/shared/utils/genre-slug';

export function SearchGenreChips() {
  const { t } = useTranslation('common');

  return (
    <ul className="search-page__genres">
      {genres.map((genre) => (
        <li key={genre}>
          <Link className="search-page__genre" href={`/anime/category/${genreToSlug(genre)}`}>
            {localizeGenreName(genre, t)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SearchLanding() {
  const { t } = useTranslation('common');

  return (
    <section className="search-page__landing">
      <p className="search-page__kicker">{t('search.kicker')}</p>
      <h1 className="search-page__title">{t('search.title')}</h1>
      <p className="search-page__hint">{t('search.hint')}</p>
      <SearchGenreChips />
    </section>
  );
}
