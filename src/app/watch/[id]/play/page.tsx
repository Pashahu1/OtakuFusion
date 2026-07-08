'use client';

import {
  StreamOriginPreconnect,

  WatchPlayShell,
} from '@/features/watch';
import './watch-play-page.scss';
import { useWatchPlayPage } from '@/features/watch/hooks/useWatchPlayPage';

export default function WatchPlayPage() {
  const { watch, animeId, watchedEpisodes, onEpisodeWatched, showErrorBlock } = useWatchPlayPage();

  return (
    <div className="watch-play-page">
      <StreamOriginPreconnect streamUrl={watch.streamUrl} streamInfo={watch.streamInfo} />
      <WatchPlayShell
        animeId={animeId}
        watchedEpisodes={watchedEpisodes}
        onEpisodeWatched={onEpisodeWatched}
        showErrorBlock={showErrorBlock}
        buffering={watch.buffering}
        streamLoadingMessage={watch.streamLoadingMessage}
        streamUrl={watch.streamUrl}
        subtitles={watch.subtitles}
        thumbnail={watch.thumbnail}
        episodeId={watch.episodeId}
        episodes={watch.episodes}
        setEpisodeId={watch.setEpisodeId}
        animeInfo={watch.animeInfo}
        episodeNum={watch.activeEpisodeNum}
        streamInfo={watch.streamInfo}
        servers={watch.servers}
        activeServerId={watch.activeServerId}
        setActiveServerId={watch.setActiveServerId}
        playerShellPending={watch.playerShellPending}
        watchStreamProvider={watch.watchStreamProvider}
        setWatchStreamProvider={watch.setWatchStreamProvider}
        streamOverlayMessage={watch.streamOverlayMessage}
        anilibertyLanguageMenuEligible={watch.anilibertyLanguageMenuEligible}
        hikkaLanguageMenuEligible={watch.hikkaLanguageMenuEligible}
        anikotoLanguageMenuEligible={watch.anikotoLanguageMenuEligible}
        playbackLang={watch.playbackLang}
        nextEpisodeSchedule={watch.nextEpisodeSchedule}
      />
    </div>
  );
}
