'use client';

import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { localizeGenreName } from '@/i18n/localize-genre';
import type { GenreStat } from '../lib/profile-stats';

interface ProfileGenreOverviewProps {
  genres: GenreStat[];
}

export function ProfileGenreOverview({ genres }: ProfileGenreOverviewProps) {
  const { t } = useTranslation('common');
  const total = genres.reduce((sum, g) => sum + g.count, 0);

  if (genres.length === 0) {
    return (
      <section className="profile-genres profile-panel" aria-label={t('profile.genresAria')}>
        <h2 className="profile-panel__title">{t('profile.genres')}</h2>
        <p className="profile-panel__empty">{t('profile.genresEmpty')}</p>
      </section>
    );
  }

  return (
    <section className="profile-genres profile-panel" aria-label={t('profile.genresAria')}>
      <h2 className="profile-panel__title">{t('profile.genres')}</h2>

      <div className="profile-genres__tags">
        {genres.map((genre) => (
          <div
            key={genre.name}
            className="profile-genres__tag"
            style={{ '--genre-color': genre.color } as CSSProperties}
          >
            <span className="profile-genres__tag-name">
              {localizeGenreName(genre.name, t)}
            </span>
            <span className="profile-genres__tag-count">
              {t('profile.entry', { count: genre.count })}
            </span>
          </div>
        ))}
      </div>

      <div className="profile-genres__bar" role="img" aria-label={t('profile.genreDistribution')}>
        {genres.map((genre) => (
          <span
            key={genre.name}
            className="profile-genres__bar-segment"
            style={{
              width: `${(genre.count / total) * 100}%`,
              backgroundColor: genre.color,
            }}
          />
        ))}
      </div>
    </section>
  );
}
