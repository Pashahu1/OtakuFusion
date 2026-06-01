'use client';

import { useMemo, useState } from 'react';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { formatEpisodeDuration } from '@/features/watch/lib/format-episode-duration';
import {
  findNextWatchEpisode,
  findWatchEpisode,
} from '@/features/watch/lib/watch-play-episode-utils';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import { WatchPlayerContent } from '@/features/watch/ui/watch-player-content/WatchPlayerContent';
import { WatchPlayMeta } from './WatchPlayMeta';
import { WatchPlayNextEpisode } from './WatchPlayNextEpisode';
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
  watchedEpisodes: Record<string, boolean>;
}

export function WatchPlayShell({
  animeId,
  watchedEpisodes,
  setEpisodeId,
  ...playerProps
}: WatchPlayShellProps) {
  const { episodes, episodeId, animeInfo, playerShellPending } = playerProps;
  const [episodesPanelOpen, setEpisodesPanelOpen] = useState(false);

  const currentEpisode = useMemo(
    () => findWatchEpisode(episodes, episodeId),
    [episodes, episodeId]
  );

  const nextEpisode = useMemo(
    () => findNextWatchEpisode(episodes, currentEpisode),
    [episodes, currentEpisode]
  );

  const nextEpisodeWatched = useMemo(() => {
    if (!nextEpisode) return false;
    const id = getEpisodeNumberFromId(nextEpisode.id) ?? String(nextEpisode.episode_no);
    return Boolean(watchedEpisodes[id]);
  }, [nextEpisode, watchedEpisodes]);

  const episodeDuration = useMemo(
    () => formatEpisodeDuration(animeInfo?.animeInfo?.tvInfo?.duration),
    [animeInfo?.animeInfo?.tvInfo?.duration]
  );

  const seriesTitle = animeInfo?.title ?? '';
  const posterUrl = animeInfo?.poster ?? '';
  const handleNextSelect = (id: string) => {
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
            isLoading={metaLoading}
          />
          <div className="watch-play-shell__aside">
            <WatchPlayNextEpisode
              nextEpisode={nextEpisode}
              posterUrl={posterUrl}
              isWatched={nextEpisodeWatched}
              onSelect={handleNextSelect}
            />
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
        episodes={episodes ?? []}
        currentEpisodeId={episodeId}
        seriesTitle={seriesTitle}
        posterUrl={posterUrl}
        episodeDuration={episodeDuration}
        watchedEpisodes={watchedEpisodes}
        onSelectEpisode={handleNextSelect}
      />
    </div>
  );
}
