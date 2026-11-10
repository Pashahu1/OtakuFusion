'use client';

import { useTranslation } from 'react-i18next';
import { localizeGenreName } from '@/i18n/localize-genre';

interface HeroSlideGenresProps {
  genres: string[];
}

export function HeroSlideGenres({ genres }: HeroSlideGenresProps) {
  const { t } = useTranslation('common');
  if (!genres.length) return null;

  return (
    <ul className="hero__genres" aria-label={t('nav.genres')}>
      {genres.map((genre) => (
        <li key={genre}>
          <span className="hero__genre-pill">{localizeGenreName(genre, t)}</span>
        </li>
      ))}
    </ul>
  );
}
