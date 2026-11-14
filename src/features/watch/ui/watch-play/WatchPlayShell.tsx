'use client';

import { useMemo, useState } from 'react';
import { formatEpisodeDuration } from '@/features/watch/lib/format-episode-duration';
import type { WatchPlaybackLanguages } from '@/features/watch/lib/watch-availability';
import { findWatchEpisode } from '@/features/watch/lib/watch-play-episode-utils';
import { WatchPlayerContent } from '@/features/watch/ui/watch-player-content/WatchPlayerContent';
import { WatchPlayEpisodesPanel } from './WatchPlayEpisodesPanel';
import { WatchTheaterChrome } from './WatchTheaterChrome';
import { useWatchPlay } from './WatchPlayProvider';
import './WatchPlayShell.scss';

export function WatchPlayShell() {
  const {
    animeId,
    watch,
    watchedEpisodes,
    onEpisodeWatched,
    showErrorBlock,
  } = useWatchPlay();

  const {
    buffering,
    streamLoadingMessage,
    streamUrl,
    subtitles,
    thumbnail,
    episodeId,
    episodes,
    setEpisodeId,
    animeInfo,
    activeEpisodeNum,
    streamInfo,
    servers,
    activeServerId,
    setActiveServerId,
    playerShellPending,
    watchStreamProvider,
    setWatchStreamProvider,
    playbackAudio,
    setPlaybackAudio,
    anikotoJapaneseEligible,
    anikotoEnglishEligible,
    streamOverlayMessage,
    hikkaLanguageMenuEligible,
  } = watch;

  const [episodesPanelOpen, setEpisodesPanelOpen] = useState(false);

  const currentEpisode = useMemo(
    () => findWatchEpisode(episodes, episodeId),
    [episodes, episodeId],
  );

  const episodeDuration = useMemo(
    () => formatEpisodeDuration(animeInfo?.animeInfo?.tvInfo?.duration),
    [animeInfo?.animeInfo?.tvInfo?.duration],
  );

  const playbackLanguages: WatchPlaybackLanguages = {
    ukrainian: hikkaLanguageMenuEligible,
    japanese: anikotoJapaneseEligible,
    english: anikotoEnglishEligible,
  };
  const seriesTitle = animeInfo?.title ?? '';
  const posterUrl = animeInfo?.poster ?? '';
  const handleEpisodeSelect = (id: string) => {
    setEpisodeId(id);
    setEpisodesPanelOpen(false);
  };

  const canOpenEpisodes = Boolean(episodes?.length);

  return (
    <div className={`watch-play-shell${episodesPanelOpen ? ' watch-play-shell--panel-open' : ''}`}>
      <div className="watch-play-shell__stage">
        <WatchPlayerContent
          animeId={animeId}
          buffering={buffering}
          streamLoadingMessage={streamLoadingMessage}
          streamUrl={streamUrl}
          subtitles={subtitles}
          thumbnail={thumbnail}
          episodeId={episodeId}
          episodes={episodes}
          setEpisodeId={setEpisodeId}
          onEpisodeWatched={onEpisodeWatched}
          animeInfo={animeInfo}
          episodeNum={activeEpisodeNum}
          streamInfo={streamInfo}
          servers={servers}
          activeServerId={activeServerId}
          setActiveServerId={setActiveServerId}
          watchStreamProvider={watchStreamProvider}
          setWatchStreamProvider={setWatchStreamProvider}
          playbackAudio={playbackAudio}
          setPlaybackAudio={setPlaybackAudio}
          anikotoJapaneseEligible={anikotoJapaneseEligible}
          anikotoEnglishEligible={anikotoEnglishEligible}
          showErrorBlock={showErrorBlock}
          playerShellPending={playerShellPending}
          streamOverlayMessage={streamOverlayMessage}
          hikkaLanguageMenuEligible={hikkaLanguageMenuEligible}
        />
        <WatchTheaterChrome
          animeId={animeId}
          animeInfo={animeInfo}
          episodeId={episodeId ?? currentEpisode?.id ?? null}
          canOpenEpisodes={canOpenEpisodes}
          onOpenEpisodes={() => setEpisodesPanelOpen(true)}
        />
      </div>

      <WatchPlayEpisodesPanel
        open={episodesPanelOpen}
        onClose={() => setEpisodesPanelOpen(false)}
        animeId={animeId}
        episodes={episodes ?? []}
        currentEpisodeId={episodeId}
        seriesTitle={seriesTitle}
        languages={playbackLanguages}
        posterUrl={posterUrl}
        episodeDuration={episodeDuration}
        watchedEpisodes={watchedEpisodes}
        onSelectEpisode={handleEpisodeSelect}
      />
    </div>
  );
}
