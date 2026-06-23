'use client';

import Link from 'next/link';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { AnimeInfo, NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import { formatWatchScheduleDate } from '@/features/watch/lib/format-watch-schedule-date';
import { WatchSeriesInlineTags } from '@/features/watch/ui/watch-series/WatchSeriesInlineTags';
import { WatchSeriesSaveButton } from '@/features/watch/ui/watch-series/WatchSeriesSaveButton';
import { watchSeriesPath } from '@/shared/utils/watch-routes';
import { WatchPlayShareButton } from './WatchPlayShareButton';
import './WatchPlayMeta.scss';

interface WatchPlayMetaProps {
  animeId: string;
  animeInfo: AnimeData | null;
  currentEpisode: EpisodesTypes | null;
  episodeId: string | null;
  playbackLang: 'sub' | 'dub';
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
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
  episodeId,
  playbackLang,
  nextEpisodeSchedule,
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

  const scheduleLabel = (() => {
    const nextIso = nextEpisodeSchedule?.nextEpisodeSchedule?.trim();
    if (nextIso) {
      return `Next episode ${formatWatchScheduleDate(nextIso)}`;
    }

    const releaseDate = animeInfo?.animeInfo?.tvInfo?.releaseDate?.trim();
    if (releaseDate) {
      return `Released on ${formatWatchScheduleDate(releaseDate)}`;
    }

    return null;
  })();

  return (
    <header className="watch-play-meta">
      <div className="watch-play-meta__top">
        {seriesTitle ? (
          <Link href={watchSeriesPath(animeId)} className="watch-play-meta__series">
            {seriesTitle}
          </Link>
        ) : isLoading ? (
          <span className="watch-play-meta__series watch-play-meta__series--skeleton" />
        ) : (
          <span className="watch-play-meta__series-spacer" aria-hidden />
        )}
        {animeInfo ? (
          <WatchSeriesSaveButton
            anime={animeDataToAnimeInfo(animeInfo)}
            appearance="ghost"
          />
        ) : null}
      </div>

      <h1 className="watch-play-meta__episode">{heading}</h1>

      {animeInfo ? (
        <WatchSeriesInlineTags
          animeInfo={animeInfo}
          showGenres={false}
          playbackLang={playbackLang}
        />
      ) : null}

      <div className="watch-play-meta__footer">
        {scheduleLabel ? (
          <p className="watch-play-meta__schedule">{scheduleLabel}</p>
        ) : (
          <span className="watch-play-meta__schedule-spacer" aria-hidden />
        )}
        <WatchPlayShareButton
          shareTitle={seriesTitle || 'OtakuFusion'}
          animeId={animeId}
          episodeId={episodeId}
        />
      </div>
    </header>
  );
}
