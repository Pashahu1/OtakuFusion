'use client';

import type { PlayerProps } from '@/shared/types/PlayerTypes';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';

import './Player.scss';
import { useArtplayerInstance } from './hooks/useArtplayerInstance';

export function Player({
  localAnimeId,
  streamUrl,
  subtitles,
  thumbnail,
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
  onPlaybackError,
  onPlaybackSurfaceReady,
  anilibertyLanguageMenuEligible = false,
  hikkaLanguageMenuEligible = false,
  anikotoLanguageMenuEligible = false,
}: PlayerProps) {
  const currentEpisodeIndex =
    episodes?.findIndex(
      (episode) => getEpisodeNumberFromId(episode.id) === episodeId
    ) ?? -1;

  const { artRef } = useArtplayerInstance({
    localAnimeId,
    streamUrl,
    subtitles,
    thumbnail,
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
    onPlaybackError,
    onPlaybackSurfaceReady,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
  });

  return <div ref={artRef} className="relative h-full w-full"></div>;
}
