'use client';

import { useMemo, useState } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult, ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { formatEpisodeDuration } from '@/features/watch/lib/format-episode-duration';
import { getEpisodeThumbnailProgress } from '@/features/watch/lib/get-episode-thumbnail-progress';
import {
  findNextWatchEpisode,
  findPrevWatchEpisode,
  findWatchEpisode,
} from '@/features/watch/lib/watch-play-episode-utils';
import { useContinueWatchingEpisodeProgress } from '@/features/watch/hooks/useContinueWatchingEpisodeProgress';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { WatchPlayerContent } from '@/features/watch/ui/watch-player-content/WatchPlayerContent';
import { WatchPlayAdjacentEpisode } from './WatchPlayAdjacentEpisode';
import { WatchPlayMeta } from './WatchPlayMeta';
import { WatchPlaySeeMoreButton } from './WatchPlaySeeMoreButton';
import { WatchPlayEpisodesPanel } from './WatchPlayEpisodesPanel';
import './WatchPlayShell.scss';

export interface WatchPlayShellProps {
  animeId: string;
  buffering: boolean;
  streamLoadingMessage: string | null;
  streamUrl: string | null;
  subtitles: SubtitleItem[] | null;
  thumbnail: string | null;
  episodeId: string | null;
  episodes: EpisodesTypes[] | null;
  setEpisodeId: React.Dispatch<React.SetStateAction<string | null>>;
  onEpisodeWatched: (episodeId: string) => void;
  animeInfo: AnimeData | null;
  episodeNum: number | null;
  streamInfo: StreamingData | null;
  servers: ServerInfo[] | null;
  activeServerId: string | null;
  setActiveServerId: (id: string | null) => void;
  showErrorBlock: boolean;
  playerShellPending: boolean;
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (p: WatchStreamProvider) => void;
  streamOverlayMessage: { title: string; subtitle: string } | null;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  watchedEpisodes: Record<string, boolean>;
  playbackLang: 'sub' | 'dub';
  nextEpisodeSchedule: NextEpisodeScheduleResult | null;
}

function episodeKeyFromEpisode(episode: EpisodesTypes): string {
  return getEpisodeNumberFromId(episode.id) ?? String(episode.episode_no);
}

export function WatchPlayShell({
  animeId,
  watchedEpisodes,
  setEpisodeId,
  playbackLang,
  nextEpisodeSchedule,
  ...playerProps
}: WatchPlayShellProps) {
  const { episodes, episodeId, animeInfo, playerShellPending } = playerProps;
  const [episodesPanelOpen, setEpisodesPanelOpen] = useState(false);
  const continueProgress = useContinueWatchingEpisodeProgress(animeId);

  const currentEpisode = useMemo(
    () => findWatchEpisode(episodes, episodeId),
    [episodes, episodeId],
  );

  const nextEpisode = useMemo(
    () => findNextWatchEpisode(episodes, currentEpisode),
    [episodes, currentEpisode],
  );

  const prevEpisode = useMemo(
    () => findPrevWatchEpisode(episodes, currentEpisode),
    [episodes, currentEpisode],
  );

  const nextEpisodeProgress = useMemo(() => {
    if (!nextEpisode) return 0;
    return getEpisodeThumbnailProgress(
      episodeKeyFromEpisode(nextEpisode),
      watchedEpisodes,
      continueProgress,
    );
  }, [continueProgress, nextEpisode, watchedEpisodes]);

  const prevEpisodeProgress = useMemo(() => {
    if (!prevEpisode) return 0;
    return getEpisodeThumbnailProgress(
      episodeKeyFromEpisode(prevEpisode),
      watchedEpisodes,
      continueProgress,
    );
  }, [continueProgress, prevEpisode, watchedEpisodes]);

  const episodeDuration = useMemo(
    () => formatEpisodeDuration(animeInfo?.animeInfo?.tvInfo?.duration),
    [animeInfo?.animeInfo?.tvInfo?.duration],
  );

  const seriesTitle = animeInfo?.title ?? '';
  const posterUrl = animeInfo?.poster ?? '';
  const handleEpisodeSelect = (id: string) => {
    setEpisodeId(id);
  };

  const metaLoading = playerShellPending && !animeInfo;
  const canOpenEpisodes = Boolean(episodes?.length);

  return (
    <div className="watch-play-shell">
      <div className="watch-play-shell__player-bleed">
        <WatchPlayerContent
          animeId={animeId}
          setEpisodeId={setEpisodeId}
          {...playerProps}
        />
      </div>

      <div className="watch-play-shell__content">
        <div className="watch-play-shell__below">
          <WatchPlayMeta
            animeId={animeId}
            animeInfo={animeInfo}
            currentEpisode={currentEpisode}
            episodeId={episodeId}
            playbackLang={playbackLang}
            nextEpisodeSchedule={nextEpisodeSchedule}
            isLoading={metaLoading}
          />
          <div className="watch-play-shell__aside">
            {nextEpisode ? (
              <WatchPlayAdjacentEpisode
                label="Next episode"
                episode={nextEpisode}
                posterUrl={posterUrl}
                progressRatio={nextEpisodeProgress}
                onSelect={handleEpisodeSelect}
              />
            ) : null}
            {prevEpisode ? (
              <WatchPlayAdjacentEpisode
                label="Previous episode"
                episode={prevEpisode}
                posterUrl={posterUrl}
                progressRatio={prevEpisodeProgress}
                onSelect={handleEpisodeSelect}
              />
            ) : null}
            <WatchPlaySeeMoreButton
              onClick={() => setEpisodesPanelOpen(true)}
              disabled={!canOpenEpisodes}
            />
          </div>
        </div>
      </div>

      <WatchPlayEpisodesPanel
        open={episodesPanelOpen}
        onClose={() => setEpisodesPanelOpen(false)}
        animeId={animeId}
        episodes={episodes ?? []}
        currentEpisodeId={episodeId}
        seriesTitle={seriesTitle}
        posterUrl={posterUrl}
        episodeDuration={episodeDuration}
        watchedEpisodes={watchedEpisodes}
        onSelectEpisode={handleEpisodeSelect}
      />
    </div>
  );
}
