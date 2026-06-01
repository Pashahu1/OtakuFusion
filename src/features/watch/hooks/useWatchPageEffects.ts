'use client';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useWatchEpisodeSelection } from './useWatchEpisodeSelection';
import { useWatchPageDocumentTitle } from './useWatchPageDocumentTitle';
import { useStreamErrorBlockDelay } from './useStreamErrorBlockDelay';
import { useApplyContinueWatchingEpisode } from './useApplyContinueWatchingEpisode';

export const useWatchPageEffects = (
  animeId: string,
  setEpisodeId: (item: string) => void,
  episodeId: string | null,
  episodes: EpisodesTypes[] | null,
  urlEp: string | undefined,
  hasAppliedSavedEpisodeRef: React.RefObject<boolean>,
  buffering: boolean,
  streamUrl: string | null,
  playerShellPending: boolean,
  animeInfo: AnimeData | null,
  errorBlockTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  setShowErrorBlock: (item: boolean) => void,
) => {
  useApplyContinueWatchingEpisode(
    urlEp,
    episodes,
    hasAppliedSavedEpisodeRef,
    animeId,
    setEpisodeId,
  );
  useWatchEpisodeSelection(episodes, episodeId, animeId, urlEp, setEpisodeId);
  useWatchPageDocumentTitle(animeInfo, animeId);
  useStreamErrorBlockDelay(
    errorBlockTimerRef,
    setShowErrorBlock,
    buffering,
    streamUrl,
    playerShellPending,
  );
};
