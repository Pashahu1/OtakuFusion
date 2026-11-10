'use client';

import { useTranslation } from 'react-i18next';

import { localizeGenreName } from '@/i18n/localize-genre';
import { getGenreMeta } from '@/shared/data/genre-hub';
import './GenreHubHeader.scss';

interface GenreHubHeaderProps {
  genre: string;
}

export function GenreHubHeader({ genre }: GenreHubHeaderProps) {
  const { t } = useTranslation('common');
  const { Icon } = getGenreMeta(genre);
  const genreLabel = localizeGenreName(genre, t);
  const description = t(`genreDesc.${genre}`, {
    defaultValue: t('genreDesc.fallback', { genre: genreLabel }),
  });

  return (
    <header className="genre-hub-header">
      <div className="genre-hub-header__icon-wrap" aria-hidden>
        <Icon className="genre-hub-header__icon" strokeWidth={1.75} />
      </div>
      <h1 className="genre-hub-header__title">{genreLabel}</h1>
      <p className="genre-hub-header__description">{description}</p>
    </header>
  );
}
