'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { localizeGenreName } from '@/i18n/localize-genre';
import { genreToSlug } from '@/shared/utils/genre-slug';
import { buildWatchAvailabilityLines } from '@/features/watch/lib/watch-availability';
import './WatchSeriesDetails.scss';

interface WatchSeriesDetailsProps {
  animeInfo: AnimeData | null;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  /** Rendered inside the series hero (Crunchyroll-style combined block). */
  embedded?: boolean;
}

export function WatchSeriesDetails({
  animeInfo,
  isExpanded,
  onToggleExpanded,
  embedded = false,
}: WatchSeriesDetailsProps) {
  const { t } = useTranslation('common');
  const overview = animeInfo?.animeInfo?.Overview?.trim();
  const { audio, subtitles } = buildWatchAvailabilityLines(
    t,
    animeInfo?.animeInfo?.tvInfo,
  );
  const genres = animeInfo?.animeInfo?.Genres ?? [];
  const details = animeInfo?.animeInfo;

  const preview =
    overview && overview.length > 380 && !isExpanded
      ? `${overview.slice(0, 380).trimEnd()}…`
      : overview;

  return (
    <section
      className={
        embedded
          ? 'watch-series-details watch-series-details--embedded'
          : 'watch-series-details'
      }
      aria-label={t('watch.aboutSeries')}
    >
      <div className="watch-series-details__inner">
        <div className="watch-series-details__synopsis">
          {overview ? (
            <p className="watch-series-details__text">{isExpanded ? overview : preview}</p>
          ) : (
            <div className="watch-series-details__skeleton" aria-hidden />
          )}
          {overview && overview.length > 380 ? (
            <button
              type="button"
              className="watch-series-details__toggle"
              onClick={onToggleExpanded}
            >
              {isExpanded ? t('watch.fewerDetails') : t('watch.moreDetails')}
            </button>
          ) : null}
        </div>

        <div className="watch-series-details__meta">
          <p className="watch-series-details__meta-row">
            <span className="watch-series-details__label">{t('watch.audio')}</span>
            <span>{audio}</span>
          </p>
          <p className="watch-series-details__meta-row">
            <span className="watch-series-details__label">{t('watch.subtitles')}</span>
            <span>{subtitles}</span>
          </p>

          {isExpanded && details ? (
            <div className="watch-series-details__extended">
              {animeInfo?.adultContent ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">{t('watch.contentAdvisory')}</span>
                  <span>{t('watch.mature')}</span>
                </p>
              ) : null}
              {genres.length > 0 ? (
                <p className="watch-series-details__meta-row watch-series-details__meta-row--genres">
                  <span className="watch-series-details__label">{t('watch.genres')}</span>
                  <span className="watch-series-details__genre-links">
                    {genres.map((genre, index) => (
                      <span key={genre}>
                        {index > 0 ? ', ' : null}
                        <Link href={`/anime/category/${genreToSlug(genre)}`}>
                          {localizeGenreName(genre, t)}
                        </Link>
                      </span>
                    ))}
                  </span>
                </p>
              ) : null}
              {details.Status ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">{t('watch.status')}</span>
                  <span>{details.Status}</span>
                </p>
              ) : null}
              {details.Aired ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">{t('watch.aired')}</span>
                  <span>{details.Aired}</span>
                </p>
              ) : null}
              {details.Duration ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">{t('watch.duration')}</span>
                  <span>{details.Duration}</span>
                </p>
              ) : null}
              {details['MAL Score'] ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">{t('watch.malScore')}</span>
                  <span>{details['MAL Score']}</span>
                </p>
              ) : null}
              {details.Studios?.length ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">{t('watch.studios')}</span>
                  <span>{details.Studios.join(', ')}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
