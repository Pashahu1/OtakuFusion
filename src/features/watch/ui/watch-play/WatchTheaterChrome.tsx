'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ListVideo } from 'lucide-react';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';
import { watchSeriesPath } from '@/shared/utils/watch-routes';
import { WatchSeriesSaveButton } from '@/features/watch/ui/watch-series/WatchSeriesSaveButton';
import { WatchPlayShareButton } from './WatchPlayShareButton';
import './WatchTheaterChrome.scss';

interface WatchTheaterChromeProps {
  animeId: string;
  animeInfo: AnimeData | null;
  episodeId: string | null;
  canOpenEpisodes: boolean;
  onOpenEpisodes: () => void;
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

export function WatchTheaterChrome({
  animeId,
  animeInfo,
  episodeId,
  canOpenEpisodes,
  onOpenEpisodes,
}: WatchTheaterChromeProps) {
  const { t } = useTranslation('common');
  const seriesTitle = animeInfo?.title?.trim() || 'OtakuFusion';

  return (
    <div className="watch-theater-chrome" aria-label={t('watch.playbackNav')}>
      <div className="watch-theater-chrome__bar">
        <Link
          href={watchSeriesPath(animeId)}
          className="watch-theater-chrome__btn"
          aria-label={t('watch.backTo', { title: seriesTitle })}
        >
          <ChevronLeft size={28} aria-hidden />
        </Link>

        <div className="watch-theater-chrome__actions">
          {animeInfo ? (
            <WatchSeriesSaveButton
              anime={animeDataToAnimeInfo(animeInfo)}
              appearance="ghost"
            />
          ) : null}
          <WatchPlayShareButton
            shareTitle={seriesTitle}
            animeId={animeId}
            episodeId={episodeId}
          />
          <button
            type="button"
            className="watch-theater-chrome__btn"
            onClick={onOpenEpisodes}
            disabled={!canOpenEpisodes}
            aria-haspopup="dialog"
            aria-label={t('watch.episodes')}
          >
            <ListVideo size={22} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
