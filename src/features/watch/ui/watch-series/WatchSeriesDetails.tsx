'use client';

import Link from 'next/link';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { genreToSlug } from '@/shared/utils/genre-slug';
import './WatchSeriesDetails.scss';

function buildAvailabilityLines(anime: AnimeData | null): {
  audio: string;
  subtitles: string;
} {
  if (!anime?.animeInfo?.tvInfo) {
    return {
      audio: 'Japanese',
      subtitles: 'English and more (player)',
    };
  }

  const tv = anime.animeInfo.tvInfo;
  const hasDub = (tv.has_dub ?? 0) > 0;
  const hasSub = (tv.has_sub ?? 0) > 0;

  return {
    audio: hasDub
      ? 'Japanese, English, Deutsch, Español (América Latina), Español (España), Français, Italiano, Português (Brasil), हिंदी, العربية (مصر), العربية, 中文 (简体), 中文 (繁體), 한국어, ภาษาไทย, Українська'
      : 'Japanese',
    subtitles: hasSub
      ? 'English, Spanish, French, German, Portuguese (BR), Arabic, Italian, Ukrainian, and more'
      : 'English and more (player)',
  };
}

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
  const overview = animeInfo?.animeInfo?.Overview?.trim();
  const { audio, subtitles } = buildAvailabilityLines(animeInfo);
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
      aria-label="About this series"
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
              {isExpanded ? 'Fewer Details' : 'More Details'}
            </button>
          ) : null}
        </div>

        <div className="watch-series-details__meta">
          <p className="watch-series-details__meta-row">
            <span className="watch-series-details__label">Audio:</span>
            <span>{audio}</span>
          </p>
          <p className="watch-series-details__meta-row">
            <span className="watch-series-details__label">Subtitles:</span>
            <span>{subtitles}</span>
          </p>

          {isExpanded && details ? (
            <div className="watch-series-details__extended">
              {animeInfo?.adultContent ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">Content Advisory:</span>
                  <span>Mature themes — 18+ recommended</span>
                </p>
              ) : null}
              {genres.length > 0 ? (
                <p className="watch-series-details__meta-row watch-series-details__meta-row--genres">
                  <span className="watch-series-details__label">Genres:</span>
                  <span className="watch-series-details__genre-links">
                    {genres.map((genre, index) => (
                      <span key={genre}>
                        {index > 0 ? ', ' : null}
                        <Link href={`/anime/category/${genreToSlug(genre)}`}>
                          {genre}
                        </Link>
                      </span>
                    ))}
                  </span>
                </p>
              ) : null}
              {details.Status ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">Status:</span>
                  <span>{details.Status}</span>
                </p>
              ) : null}
              {details.Aired ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">Aired:</span>
                  <span>{details.Aired}</span>
                </p>
              ) : null}
              {details.Duration ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">Duration:</span>
                  <span>{details.Duration}</span>
                </p>
              ) : null}
              {details['MAL Score'] ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">MAL Score:</span>
                  <span>{details['MAL Score']}</span>
                </p>
              ) : null}
              {details.Studios?.length ? (
                <p className="watch-series-details__meta-row">
                  <span className="watch-series-details__label">Studios:</span>
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
