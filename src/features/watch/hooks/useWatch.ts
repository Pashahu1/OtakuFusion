import { useCallback, useEffect, useMemo } from 'react';
import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';
import { isAnilistStillAiringFromStatus } from '@/lib/catalog/providers/aniliberty/anilibertyEpisodeMatch';
import { useWatchAnime } from './useWatchAnime';
import { useWatchStream, type WatchStreamAnimeMeta } from './useWatchStream';
import { useWatchProviderState } from './useWatchProviderState';
import { useWatchStreamLang } from './useWatchStreamLang';
import { useWatchProviderGate } from './useWatchProviderGate';
import { useWatchDubFallback } from './useWatchDubFallback';
import { useWatchStreamOverlay } from './useWatchStreamOverlay';

export function useWatch(
  animeId: string,
  initialEpisodeId: string | undefined
): UseWatchReturn {
  const {
    watchStreamProvider,
    setWatchStreamProvider,
    streamLangRevision,
    setStreamLangRevision,
  } = useWatchProviderState(animeId);

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
  });

  const playerShellPending =
    anime.animeInfoLoading ||
    anime.episodes === null ||
    (anime.episodeId == null &&
      Array.isArray(anime.episodes) &&
      anime.episodes.length > 0) ||
    (Boolean(anime.episodeId) &&
      Array.isArray(anime.episodes) &&
      anime.episodes.length > 0 &&
      anime.episodes.every((e: EpisodesTypes) => !episodeMatchesSelection(e, anime.episodeId)));

  const streamAnimeMeta = useMemo((): WatchStreamAnimeMeta | null => {
    const a = anime.animeInfo;
    if (!a) return null;
    return {
      id: a.id,
      mal_id: a.mal_id ?? null,
      title: a.title,
    };
  }, [anime.animeInfo?.id, anime.animeInfo?.mal_id, anime.animeInfo?.title]);

  const episodeEpToken = useMemo(() => {
    if (!anime.episodeId || !anime.episodes?.length) return null;
    if (anime.providerCatalogPending) return null;
    if (
      anime.episodesSourceProvider != null &&
      anime.episodesSourceProvider !== watchStreamProvider
    ) {
      return null;
    }
    const ep = anime.episodes.find((e: EpisodesTypes) =>
      episodeMatchesSelection(e, anime.episodeId)
    );
    return ep?.ep_token?.trim() || null;
  }, [
    anime.episodes,
    anime.episodeId,
    anime.providerCatalogPending,
    anime.episodesSourceProvider,
    watchStreamProvider,
  ]);

  const anilistStillAiring = useMemo(
    () => isAnilistStillAiringFromStatus(anime.animeInfo?.animeInfo?.Status),
    [anime.animeInfo?.animeInfo?.Status]
  );

  const expectedEpisodesForResolve = useMemo((): number | undefined => {
    if (anilistStillAiring) return undefined;
    const et = anime.animeInfo?.animeInfo?.tvInfo?.episodeTotal?.trim();
    if (!et || !/^\d+$/.test(et)) return undefined;
    const n = parseInt(et, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [anilistStillAiring, anime.animeInfo?.animeInfo?.tvInfo?.episodeTotal]);

  const onAutoRetryExhausted = useCallback(() => {
    setWatchStreamProvider('animepahe');
    setActiveServerIdRaw('1');
  }, [setWatchStreamProvider, setActiveServerIdRaw]);

  const watchResolveOptions = useMemo(
    () => ({
      animeId,
      episodeId: anime.episodeId,
      streamAnime: streamAnimeMeta,
      providerAnimeId:
        watchStreamProvider === 'aniliberty'
          ? anime.anilibertyCatalogProviderId
          : watchStreamProvider === 'hikka'
            ? anime.hikkaCatalogProviderId
            : anime.animepaheCatalogProviderId,
      episodeEpToken,
      episodeHasDub: episodeHasDubForResolve,
      expectedEpisodes: expectedEpisodesForResolve,
      anilistStillAiring,
      preferredLang: resolverLang,
      onPlaybackLangResolved,
      watchStreamProvider,
      streamLangRevision,
      episodeDubStateKey,
      providerCatalogPending: anime.providerCatalogPending,
      episodesSourceProvider: anime.episodesSourceProvider,
      onAutoRetryExhausted,
      anilibertyCatalogVerified:
        watchStreamProvider === 'aniliberty' &&
        Boolean(anime.anilibertyCatalogProviderId?.trim()) &&
        anime.episodesSourceProvider === 'aniliberty',
    }),
    [
      streamAnimeMeta,
      anime.episodeId,
      anime.providerCatalogPending,
      anime.episodesSourceProvider,
      anime.animepaheCatalogProviderId,
      anime.anilibertyCatalogProviderId,
      anime.hikkaCatalogProviderId,
      episodeEpToken,
      episodeHasDubForResolve,
      episodeDubStateKey,
      resolverLang,
      onPlaybackLangResolved,
      expectedEpisodesForResolve,
      anilistStillAiring,
      animeId,
      watchStreamProvider,
      streamLangRevision,
      onAutoRetryExhausted,
    ]
  );

  const stream = useWatchStream(watchResolveOptions);

  const streamHardExhausted = useWatchDubFallback({
    watchStreamProvider,
    activeServerId,
    resolverLang,
    userChoseDub,
    setActiveServerIdRaw,
    stream,
    resetKey: `${animeId}:${anime.episodeId ?? ''}:${watchStreamProvider}`,
  });

  useWatchProviderGate({
    watchStreamProvider,
    setWatchStreamProvider,
    animeInfoLoading: anime.animeInfoLoading,
    providerCatalogPending: anime.providerCatalogPending,
    anilibertyLanguageMenuEligible: anime.anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible: anime.hikkaLanguageMenuEligible,
  });

  useEffect(() => {
    if (!anime.animeInfo || anime.animeInfoLoading) return;
    if (watchStreamProvider !== 'animepahe') return;
    anime.runDeferredOppositeProviderPrefetch();
  }, [
    anime.animeInfo,
    anime.animeInfoLoading,
    watchStreamProvider,
    animeId,
    anime.runDeferredOppositeProviderPrefetch,
  ]);

  useEffect(() => {
    if (!stream.streamUrl) return;
    anime.runDeferredOppositeProviderPrefetch();
  }, [stream.streamUrl, animeId, anime.runDeferredOppositeProviderPrefetch]);

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

  const activeEpisodeNum = useMemo((): number | null => {
    const { episodes, episodeId } = anime;
    if (!episodes?.length || !episodeId) return null;
    const ep = episodes.find((e: EpisodesTypes) => episodeMatchesSelection(e, episodeId));
    return ep?.episode_no ?? null;
  }, [anime.episodes, anime.episodeId]);

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
  };
}
