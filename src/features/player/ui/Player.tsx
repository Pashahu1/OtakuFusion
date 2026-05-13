'use client';

import { useChapterStyles } from '@/hooks/useChapterStyles';
import type { PlayerProps } from '@/shared/types/PlayerTypes';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';

import './Player.scss';
import { useArtplayerInstance } from './hooks/useArtplayerInstance';

export function Player({
  streamUrl,
  subtitles,
  thumbnail,
  intro,
  outro,
  episodeId,
  episodes,
  playNext,
  onEpisodeWatched,
  animeInfo,
  episodeNum,
  streamInfo,
  servers = null,
  activeServerId = null,
  setActiveServerId = () => {},
  watchStreamProvider,
  setWatchStreamProvider,
  anilibertyAlias,
  onPlaybackError,
  onPlaybackSurfaceReady,
}: PlayerProps) {
  const currentEpisodeIndex =
    episodes?.findIndex(
      (episode) => getEpisodeNumberFromId(episode.id) === episodeId
    ) ?? -1;

  useChapterStyles(streamUrl, intro, outro);

  const { artRef } = useArtplayerInstance({
    streamUrl,
    subtitles,
    thumbnail,
    intro,
    outro,
    episodeId,
    episodes,
    currentEpisodeIndex,
    playNext,
    onEpisodeWatched,
    animeInfo,
    episodeNum,
    streamInfo,
    servers,
    activeServerId,
    setActiveServerId,
    watchStreamProvider,
    setWatchStreamProvider,
    anilibertyAlias,
    onPlaybackError,
    onPlaybackSurfaceReady,
  });

  return <div ref={artRef} className="relative h-full w-full"></div>;
}
