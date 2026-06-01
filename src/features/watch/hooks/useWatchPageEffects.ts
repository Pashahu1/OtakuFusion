'use client';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useContinueWatchingFlagReset } from './useContinueWatchingFlagReset';
import { useWatchEpisodeSelection } from './useWatchEpisodeSelection';
import { useApplyContinueWatchingEpisode } from './useApplyContinueWatchingEpisode';
import { useWatchPageDocumentTitle } from './useWatchPageDocumentTitle';
import { useStreamErrorBlockDelay } from './useStreamErrorBlockDelay';

export const useWatchPageEffects = (
  hasAppliedSavedEpisodeRef: React.RefObject<boolean>,
  animeId: string,
  setEpisodeId: (item: string) => void,
  episodeId: string | null,
  episodes: EpisodesTypes[] | null,
  urlEp: string | undefined,
  buffering: boolean,
  streamUrl: string | null,
  playerShellPending: boolean,
  animeInfo: AnimeData | null,
  errorBlockTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  setShowErrorBlock: (item: boolean) => void
) => {
  useContinueWatchingFlagReset(hasAppliedSavedEpisodeRef, animeId);
  useApplyContinueWatchingEpisode(
    urlEp,
    episodes,
    hasAppliedSavedEpisodeRef,
    animeId,
    setEpisodeId
  );
  useWatchEpisodeSelection(
    episodes,
    episodeId,
    animeId,
    urlEp,
    setEpisodeId
  );
  useWatchPageDocumentTitle(animeInfo, animeId);
  useStreamErrorBlockDelay(
    errorBlockTimerRef,
    setShowErrorBlock,
    buffering,
    streamUrl,
    playerShellPending
  );
};
