'use client';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { NextEpisodeScheduleResult } from '@/shared/types/GlobalAnimeTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useContinueWatchingFlagReset } from './useContinueWatchingFlagReset';
import { useWatchEpisodeSelection } from './useWatchEpisodeSelection';
import { useApplyContinueWatchingEpisode } from './useApplyContinueWatchingEpisode';
import { useWatchPageDocumentTitle } from './useWatchPageDocumentTitle';
import { useStreamErrorBlockDelay } from './useStreamErrorBlockDelay';
import { usePlayerColumnHeightSync } from './usePlayerColumnHeightSync';

export const useWatchPageEffects = (
  hasAppliedSavedEpisodeRef: React.RefObject<boolean>,
  animeId: string,
  setEpisodeId: (item: string) => void,
  episodeId: string | null,
  episodes: EpisodesTypes[] | null,
  urlEp: string | undefined,
  isFirstSetRef: React.RefObject<boolean>,
  serverLoading: boolean,
  buffering: boolean,
  streamUrl: string | null,
  animeInfo: AnimeData | null,
  nextEpisodeSchedule: NextEpisodeScheduleResult | null,
  errorBlockTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  setShowErrorBlock: (item: boolean) => void,
  playerColumnRef: React.RefObject<HTMLDivElement | null>,
  setEpisodesColumnHeight: (height: number | null) => void
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
    setEpisodeId,
    isFirstSetRef
  );
  useWatchPageDocumentTitle(animeInfo, animeId);
  useStreamErrorBlockDelay(
    errorBlockTimerRef,
    setShowErrorBlock,
    serverLoading,
    buffering,
    streamUrl
  );
  usePlayerColumnHeightSync(
    playerColumnRef,
    setEpisodesColumnHeight,
    streamUrl,
    serverLoading,
    buffering,
    nextEpisodeSchedule
  );
};
