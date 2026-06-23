'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { genreToSlug } from '@/shared/utils/genre-slug';

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
  const tv = animeInfo.animeInfo?.tvInfo;
  const genres = animeInfo.animeInfo?.Genres ?? [];
  const hasSub = (tv?.has_sub ?? 0) > 0;
  const hasDub = (tv?.has_dub ?? 0) > 0;

  const parts: ReactNode[] = [];

  if (animeInfo.adultContent) {
    parts.push(
      <span key="age" className="watch-series-tags__age">
        18+
      </span>
    );
  }

  if (playbackLang) {
    parts.push(
      <span key="playback" className="watch-series-tags__lang">
        {playbackLang === 'dub' ? 'Dubbed' : 'Subtitled'}
      </span>
    );
  } else {
    if (hasSub) {
      parts.push(
        <span key="sub" className="watch-series-tags__lang">
          Sub
        </span>
      );
    }

    if (hasDub) {
      parts.push(
        <span key="dub" className="watch-series-tags__lang">
          Dub
        </span>
      );
    }

    if (!hasSub && !hasDub) {
      parts.push(
        <span key="sub-fallback" className="watch-series-tags__lang">
          Sub
        </span>
      );
    }
  }

  return (
    <p className="watch-series-tags">
      {parts.map((node, index) => (
        <span key={index} className="watch-series-tags__segment">
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
                <Link href={`/anime/category/${genreToSlug(genre)}`}>{genre}</Link>
              </span>
            ))}
          </span>
        </>
      ) : null}
    </p>
  );
}
