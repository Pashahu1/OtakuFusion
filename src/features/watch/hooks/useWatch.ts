import { useMemo, useRef } from 'react';

import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';
import { useWatchAnime } from './useWatchAnime';
import { useWatchStream } from './useWatchStream';
import { useWatchProviderState } from './useWatchProviderState';
import { useWatchStreamLang } from './useWatchStreamLang';
import { useWatchProviderGate } from './useWatchProviderGate';
import { useWatchDubFallback } from './useWatchDubFallback';
import { useWatchStreamOverlay } from './useWatchStreamOverlay';
import {
  computePlayerShellPending,
  selectActiveEpisodeNum,
} from './use-watch/watchCatalogSelectors';
import { useWatchResolveOptions } from './use-watch/useWatchResolveOptions';
import { useWatchOppositePrefetch } from './use-watch/useWatchOppositePrefetch';
import { useWatchCatalogProviderFallback } from './useWatchCatalogProviderFallback';
import { readContinueWatchingPlaybackPrefs } from '@/features/watch/lib/read-continue-watching-playback-prefs';

import { useRestoreContinueWatchingPlayback } from './useRestoreContinueWatchingPlayback';

export function useWatch(
  animeId: string,
  initialEpisodeId: string | undefined,
): UseWatchReturn {
  const continuePrefsTokenRef = useRef('');
  const continuePlaybackPrefsRef = useRef(
    null as ReturnType<typeof readContinueWatchingPlaybackPrefs>,
  );

  const prefsToken = `${animeId}:${initialEpisodeId ?? ''}`;
  if (continuePrefsTokenRef.current !== prefsToken) {
    continuePrefsTokenRef.current = prefsToken;
    continuePlaybackPrefsRef.current =
      typeof window !== 'undefined'
        ? readContinueWatchingPlaybackPrefs(animeId, initialEpisodeId)
        : null;
  }
  const continuePlaybackPrefs = continuePlaybackPrefsRef.current;

  const {
    watchStreamProvider,
    setWatchStreamProvider,
    streamLangRevision,
    setStreamLangRevision,
  } = useWatchProviderState(animeId, continuePlaybackPrefs?.watchStreamProvider);

  const anime = useWatchAnime(animeId, initialEpisodeId, watchStreamProvider);

  const dubFromTv = anime.animeInfo?.animeInfo?.tvInfo?.has_dub ?? 0;

  const {
    activeServerId,
    setActiveServerId,
    setActiveServerIdRaw,
    servers,
    resolverLang,
    episodeDubStateKey,
    episodeHasDubForResolve,
    onPlaybackLangResolved,
    userChoseDub,
  } = useWatchStreamLang({
    animeId,
    watchStreamProvider,
    episodeId: anime.episodeId,
    episodes: anime.episodes,
    dubFromTv,
    setStreamLangRevision,
    initialStreamLang: continuePlaybackPrefs?.streamLang,
  });

  useRestoreContinueWatchingPlayback({
    animeId,
    episodeId: anime.episodeId,
    urlEpisodeId: initialEpisodeId,
    skipRestore: continuePlaybackPrefs != null,
    setWatchStreamProvider,
    setActiveServerId,
  });

  const playerShellPending = computePlayerShellPending({
    animeInfoLoading: anime.animeInfoLoading,
    episodes: anime.episodes,
    episodeId: anime.episodeId,
  });

  const watchResolveOptions = useWatchResolveOptions({
    animeId,
    anime,
    watchStreamProvider,
    streamLangRevision,
    resolverLang,
    episodeHasDubForResolve,
    episodeDubStateKey,
    onPlaybackLangResolved,
    setWatchStreamProvider,
    setActiveServerIdRaw,
  });

  const stream = useWatchStream(watchResolveOptions);

  const streamHardExhausted = useWatchDubFallback();

  useWatchCatalogProviderFallback({
    animeId,
    watchStreamProvider,
    error: anime.error,
    providerCatalogPending: anime.providerCatalogPending,
    setWatchStreamProvider,
  });

  useWatchProviderGate({
    watchStreamProvider,
    setWatchStreamProvider,
    animeInfoLoading: anime.animeInfoLoading,
    providerCatalogPending: anime.providerCatalogPending,
    error: anime.error,
    anilibertyLanguageMenuEligible: anime.anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible: anime.hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible: anime.anikotoLanguageMenuEligible,
  });

  useWatchOppositePrefetch({
    animeId,
    watchStreamProvider,
    animeInfo: anime.animeInfo,
    animeInfoLoading: anime.animeInfoLoading,
    streamUrl: stream.streamUrl,
    runDeferredOppositeProviderPrefetch: anime.runDeferredOppositeProviderPrefetch,
  });

  const { streamOverlayMessage, episodesForUi, totalEpisodesForUi } = useWatchStreamOverlay({
    playerShellPending,
    streamBuffering: stream.buffering,
    streamUrl: stream.streamUrl,
    streamResolveAttempted: stream.resolveAttempted,
    streamHardExhausted,
    catalogError: anime.error,
    episodes: anime.episodes,
    totalEpisodes: anime.totalEpisodes ?? 0,
  });

  const activeEpisodeNum = useMemo(
    () => selectActiveEpisodeNum(anime.episodes, anime.episodeId),
    [anime.episodes, anime.episodeId],
  );

  const error = anime.error ?? stream.error ?? null;

  return {
    error,
    buffering: stream.buffering,
    streamLoadingMessage: stream.streamLoadingMessage,
    streamInfo: stream.streamInfo,
    animeInfo: anime.animeInfo,
    episodes: episodesForUi,
    nextEpisodeSchedule: anime.nextEpisodeSchedule,
    animeInfoLoading: anime.animeInfoLoading,
    playerShellPending,
    totalEpisodes: totalEpisodesForUi,
    servers,
    streamUrl: stream.streamUrl,
    subtitles: stream.subtitles.length ? stream.subtitles : null,
    thumbnail: stream.thumbnail,
    episodeId: anime.episodeId,
    setEpisodeId: anime.setEpisodeId,
    activeEpisodeNum,
    activeServerId,
    setActiveServerId,
    watchStreamProvider,
    setWatchStreamProvider,
    streamErrorCode: stream.errorCode,
    streamOverlayMessage,
    anilibertyLanguageMenuEligible: anime.anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible: anime.hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible: anime.anikotoLanguageMenuEligible,
  };
}
