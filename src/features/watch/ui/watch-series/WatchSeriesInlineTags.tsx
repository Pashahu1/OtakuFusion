'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { localizeGenreName } from '@/i18n/localize-genre';
import { genreToSlug } from '@/shared/utils/genre-slug';
import {
  isUkrainianDubOnlyPlayback,
  seriesCatalogLangBadges,
} from '@/features/watch/lib/watch-availability';

interface WatchSeriesInlineTagsProps {
  animeInfo: AnimeData;
  /** Play page: Sub | Dub only (no genre links). */
  showGenres?: boolean;
  /** Play page: show active playback mode instead of catalog Sub | Dub. */
  playbackLang?: 'sub' | 'dub';
}

export function WatchSeriesInlineTags({
  animeInfo,
  showGenres = true,
  playbackLang,
}: WatchSeriesInlineTagsProps) {
  const { t } = useTranslation('common');
  const tv = animeInfo.animeInfo?.tvInfo;
  const genres = animeInfo.animeInfo?.Genres ?? [];
  const catalogBadges = seriesCatalogLangBadges(tv);
  const shownPlaybackLang = playbackLang
    ? isUkrainianDubOnlyPlayback()
      ? 'dub'
      : playbackLang
    : undefined;

  const parts: { id: string; node: ReactNode }[] = [];

  if (animeInfo.adultContent) {
    parts.push({
      id: 'age',
      node: (
        <span className="watch-series-tags__age">
          18+
        </span>
      ),
    });
  }

  if (shownPlaybackLang) {
    parts.push({
      id: 'playback',
      node: (
        <span className="watch-series-tags__lang">
          {shownPlaybackLang === 'dub' ? 'Dubbed' : 'Subtitled'}
        </span>
      ),
    });
  } else {
    for (const badge of catalogBadges) {
      parts.push({
        id: badge,
        node: (
          <span className="watch-series-tags__lang">
            {badge === 'dub' ? 'Dub' : 'Sub'}
          </span>
        ),
      });
    }
  }

  return (
    <p className="watch-series-tags">
      {parts.map(({ id, node }, index) => (
        <span key={id} className="watch-series-tags__segment">
          {index > 0 ? (
            <span className="watch-series-tags__sep" aria-hidden>
              {playbackLang ? '•' : '|'}
            </span>
          ) : null}
          {node}
        </span>
      ))}
      {showGenres && genres.length > 0 ? (
        <>
          <span className="watch-series-tags__bullet" aria-hidden>
            •
          </span>
          <span className="watch-series-tags__genres">
            {genres.map((genre, index) => (
              <span key={genre}>
                {index > 0 ? (
                  <span className="watch-series-tags__genre-comma">, </span>
                ) : null}
                <Link href={`/anime/category/${genreToSlug(genre)}`}>
                  {localizeGenreName(genre, t)}
                </Link>
              </span>
            ))}
          </span>
        </>
      ) : null}
    </p>
  );
}
