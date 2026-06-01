'use client';

import Link from 'next/link';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { watchSeriesPath } from '@/shared/utils/watch-routes';
import { WatchSeriesInlineTags } from '@/features/watch/ui/watch-series/WatchSeriesInlineTags';
import { WatchSeriesSaveButton } from '@/features/watch/ui/watch-series/WatchSeriesSaveButton';

interface WatchPlayMetaProps {
  animeId: string;
  animeInfo: AnimeData | null;
  currentEpisode: EpisodesTypes | null;
  isLoading: boolean;
}

function animeDataToAnimeInfo(data: AnimeData): AnimeInfo {
  return {
    id: data.id,
    data_id: data.data_id,
    poster: data.poster,
    title: data.title,
    japanese_title: data.japanese_title,
    description: data.animeInfo?.Overview,
    tvInfo: data.animeInfo?.tvInfo,
    adultContent: data.adultContent,
  };
}

export function WatchPlayMeta({
  animeId,
  animeInfo,
  currentEpisode,
  isLoading,
}: WatchPlayMetaProps) {
  const seriesTitle = animeInfo?.title ?? '';
  const epNo = currentEpisode?.episode_no;
  const epTitle = currentEpisode?.title?.trim();
  const heading =
    epNo != null
      ? `E${epNo}${epTitle ? ` — ${epTitle}` : ''}`
      : isLoading
        ? 'Loading episode…'
        : 'Episode';

  return (
    <header className="watch-play-meta">
      <div className="watch-play-meta__titles">
        {seriesTitle ? (
          <Link href={watchSeriesPath(animeId)} className="watch-play-meta__series">
            {seriesTitle}
          </Link>
        ) : isLoading ? (
          <span className="watch-play-meta__series watch-play-meta__series--skeleton" />
        ) : null}
        <h1 className="watch-play-meta__episode">{heading}</h1>
        {animeInfo ? (
          <WatchSeriesInlineTags animeInfo={animeInfo} showGenres={false} />
        ) : null}
      </div>
      {animeInfo ? (
        <WatchSeriesSaveButton anime={animeDataToAnimeInfo(animeInfo)} />
      ) : null}
    </header>
  );
}
