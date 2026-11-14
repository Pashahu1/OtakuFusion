'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { localizeGenreName } from '@/i18n/localize-genre';
import { genreToSlug } from '@/shared/utils/genre-slug';
import {
  formatPlaybackLanguageLine,
  type WatchPlaybackLanguages,
} from '@/features/watch/lib/watch-availability';

interface WatchSeriesInlineTagsProps {
  animeInfo: AnimeData;
  languages: WatchPlaybackLanguages;
  /** Play page: Sub | Dub only (no genre links). */
  showGenres?: boolean;
}

export function WatchSeriesInlineTags({
  animeInfo,
  languages,
  showGenres = true,
}: WatchSeriesInlineTagsProps) {
  const { t } = useTranslation('common');
  const genres = animeInfo.animeInfo?.Genres ?? [];
  const languageLine = formatPlaybackLanguageLine(languages, t);

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

  if (languageLine) {
    parts.push({
      id: 'audio',
      node: <span className="watch-series-tags__lang">{languageLine}</span>,
    });
  }

  return (
    <p className="watch-series-tags">
      {parts.map(({ id, node }, index) => (
        <span key={id} className="watch-series-tags__segment">
          {index > 0 ? (
            <span className="watch-series-tags__sep" aria-hidden>
              •
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
