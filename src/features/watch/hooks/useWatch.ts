import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  type SetStateAction,
} from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { writeWatchStreamProvider } from '@/features/watch/lib/watch-provider';
import {
  episodeMatchesSelection,
  getEpisodeNumberFromId,
} from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import { STORAGE_SERVER_TYPE } from '@/shared/data/servers';
import { isAnilistStillAiringFromStatus } from '@/lib/catalog/providers/aniliberty/anilibertyEpisodeMatch';
import { useWatchAnime } from './useWatchAnime';
import { useWatchStream, type WatchStreamAnimeMeta } from './useWatchStream';

export function useWatch(
  animeId: string,
  initialEpisodeId: string | undefined
): UseWatchReturn {
  const [streamLangRevision, setStreamLangRevision] = useState(0);
  const [watchStreamProvider, setWatchStreamProviderState] =
    useState<WatchStreamProvider>('animepahe');
  const [streamHardExhausted, setStreamHardExhausted] = useState(false);
  const issuedDubToSubFallbackRef = useRef(false);
  const userChoseDubRef = useRef(false);

  const setWatchStreamProvider = useCallback((next: WatchStreamProvider) => {
    setWatchStreamProviderState((prev) => {
      if (prev === next) return prev;
      writeWatchStreamProvider(next);
      setStreamLangRevision((n) => n + 1);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!animeId.trim()) return;
    setWatchStreamProvider('animepahe');
  }, [animeId, setWatchStreamProvider]);

  const anime = useWatchAnime(animeId, initialEpisodeId, watchStreamProvider);

  useEffect(() => {
    issuedDubToSubFallbackRef.current = false;
    userChoseDubRef.current = false;
    setStreamHardExhausted(false);
  }, [animeId, anime.episodeId, watchStreamProvider]);

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

  const [activeServerId, setActiveServerIdRaw] = useState<string | null>('1');

  useEffect(() => {
    setActiveServerIdRaw('1');
  }, [animeId]);

  const setActiveServerId = useCallback((value: SetStateAction<string | null>) => {
    setActiveServerIdRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (next === '2') userChoseDubRef.current = true;
      if (next === '1') userChoseDubRef.current = false;
      return next;
    });
    setStreamLangRevision((n) => n + 1);
  }, []);

  const streamAnimeMeta = useMemo((): WatchStreamAnimeMeta | null => {
    const a = anime.animeInfo;
    if (!a) return null;
    return {
      id: a.id,
      mal_id: a.mal_id ?? null,
      title: a.title,
    };
  }, [anime.animeInfo?.id, anime.animeInfo?.mal_id, anime.animeInfo?.title]);

  const hasAnyDub = useMemo(() => {
    const dubFromTv = anime.animeInfo?.animeInfo?.tvInfo?.has_dub ?? 0;
    if (dubFromTv > 0) return true;
    if (anime.animepaheCatalogProviderId?.trim()) return true;
    if (watchStreamProvider === 'animepahe') {
      if (Boolean(anime.episodes?.some((e) => e.hasDub === true))) return true;
      return true;
    }
    return true;
  }, [
    anime.animeInfo?.animeInfo?.tvInfo?.has_dub,
    anime.animepaheCatalogProviderId,
    anime.episodes,
    watchStreamProvider,
  ]);

  const currentEpisodeHasDub = useMemo(() => {
    const ep = anime.episodes?.find((e: EpisodesTypes) =>
      episodeMatchesSelection(e, anime.episodeId)
    );
    return ep?.hasDub === true;
  }, [anime.episodes, anime.episodeId]);

  const resolverLang = useMemo<'sub' | 'dub'>(() => {
    if (watchStreamProvider === 'aniliberty' || watchStreamProvider === 'hikka') return 'sub';
    if (activeServerId !== '2') return 'sub';
    return 'dub';
  }, [watchStreamProvider, activeServerId]);

  const preferredLang = useMemo<'sub' | 'dub'>(
    () => (activeServerId === '2' ? 'dub' : 'sub'),
    [activeServerId]
  );

  useEffect(() => {
    if (userChoseDubRef.current) return;
    if (watchStreamProvider === 'aniliberty' || watchStreamProvider === 'hikka') {
      if (activeServerId === '2') setActiveServerIdRaw('1');
      return;
    }
    if (!hasAnyDub && activeServerId === '2') {
      setActiveServerIdRaw('1');
    }
  }, [watchStreamProvider, activeServerId, hasAnyDub]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SERVER_TYPE, preferredLang);
  }, [preferredLang]);

  const servers = useMemo<ServerInfo[]>(() => {
    const base: ServerInfo[] = [
      { type: 'sub', data_id: 1, server_id: 1, serverName: 'Japanese' },
    ];
    if (hasAnyDub) {
      base.push({
        type: 'dub',
        data_id: 2,
        server_id: 2,
        serverName: 'English',
      });
    }
    return base;
  }, [hasAnyDub]);

  const onPlaybackLangResolved = useCallback((lang: 'sub' | 'dub') => {
    if (userChoseDubRef.current && lang === 'sub') return;
    setActiveServerIdRaw(lang === 'dub' ? '2' : '1');
  }, []);

  const episodeDubStateKey = useMemo(
    () =>
      `${anime.episodeId ?? ''}:${
        currentEpisodeHasDub === true ? '1' : '0'
      }:${hasAnyDub ? '1' : '0'}`,
    [anime.episodeId, currentEpisodeHasDub, hasAnyDub]
  );

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
    const token = ep?.ep_token?.trim();
    return token || null;
  }, [
    anime.episodes,
    anime.episodeId,
    anime.providerCatalogPending,
    anime.episodesSourceProvider,
    watchStreamProvider,
  ]);

  const episodeHasDubForResolve = useMemo((): boolean | undefined => {
    if (!anime.episodeId || !anime.episodes?.length) return undefined;
    const ep = anime.episodes.find((e: EpisodesTypes) =>
      episodeMatchesSelection(e, anime.episodeId)
    );
    if (ep?.hasDub === true) return true;
    if (ep?.hasDub === false) return false;
    return undefined;
  }, [anime.episodes, anime.episodeId]);

  /** Only on episode change: if catalog has no dub — start with Japanese. Do not override manual English choice. */
  useEffect(() => {
    if (watchStreamProvider !== 'animepahe') return;
    if (episodeHasDubForResolve !== false) return;
    userChoseDubRef.current = false;
    setActiveServerIdRaw('1');
    setStreamLangRevision((n) => n + 1);
  }, [watchStreamProvider, episodeHasDubForResolve, anime.episodeId]);

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
  }, [setWatchStreamProvider]);

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
      expectedEpisodesForResolve,
      anilistStillAiring,
      animeId,
      watchStreamProvider,
      resolverLang,
      onPlaybackLangResolved,
      streamLangRevision,
      episodeDubStateKey,
      onAutoRetryExhausted,
      anime.episodesSourceProvider,
    ]
  );

  const stream = useWatchStream(watchResolveOptions);

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

  useEffect(() => {
    if (watchStreamProvider === 'aniliberty') {
      if (anime.animeInfoLoading || anime.providerCatalogPending) return;
      if (anime.anilibertyLanguageMenuEligible) return;
      setWatchStreamProvider('animepahe');
      return;
    }
    if (watchStreamProvider === 'hikka') {
      if (anime.animeInfoLoading || anime.providerCatalogPending) return;
      if (anime.hikkaLanguageMenuEligible) return;
      setWatchStreamProvider('animepahe');
    }
  }, [
    watchStreamProvider,
    anime.animeInfoLoading,
    anime.providerCatalogPending,
    anime.anilibertyLanguageMenuEligible,
    anime.hikkaLanguageMenuEligible,
    setWatchStreamProvider,
  ]);

  useEffect(() => {
    if (!stream.resolveAttempted || stream.buffering) return;
    if (stream.streamUrl) return;
    if (!stream.errorCode) return;
    if (watchStreamProvider !== 'animepahe') return;
    if (activeServerId !== '2') return;
    if (resolverLang !== 'dub') return;

    const code = stream.errorCode.toLowerCase();
    if (code.includes('episode_not_found')) return;
    if (code.includes('animepahe_sources_empty')) return;
    if (code.includes('episode is required')) return;
    if (code.includes('lang must')) return;
    if (code.includes('watch_resolve_invalid_json')) return;
    if (code.includes('watch_resolve_empty')) return;

    if (userChoseDubRef.current) {
      return;
    }

    issuedDubToSubFallbackRef.current = true;
    setActiveServerIdRaw('1');
  }, [
    stream.resolveAttempted,
    stream.buffering,
    stream.streamUrl,
    stream.errorCode,
    watchStreamProvider,
    activeServerId,
    resolverLang,
  ]);

  useEffect(() => {
    if (!stream.streamUrl) return;
    issuedDubToSubFallbackRef.current = false;
    setStreamHardExhausted(false);
  }, [stream.streamUrl]);

  useEffect(() => {
    if (!issuedDubToSubFallbackRef.current) return;
    if (!stream.resolveAttempted || stream.buffering || stream.streamUrl) return;
    if (watchStreamProvider !== 'animepahe') return;
    if (activeServerId !== '1' || resolverLang !== 'sub') return;
    if (!stream.errorCode) return;

    setStreamHardExhausted(true);
  }, [
    stream.resolveAttempted,
    stream.buffering,
    stream.streamUrl,
    stream.errorCode,
    watchStreamProvider,
    activeServerId,
    resolverLang,
  ]);

  const streamOverlayMessage = useMemo((): { title: string; subtitle: string } | null => {
    if (playerShellPending || stream.buffering || stream.streamUrl) return null;

    const catalogErr = anime.error?.trim();
    if (catalogErr) {
      return {
        title: 'Could not load this title.',
        subtitle: catalogErr,
      };
    }

    if (!stream.resolveAttempted) return null;

    if (streamHardExhausted) {
      return {
        title: 'Playback could not be started.',
        subtitle:
          'You may have hit a temporary rate limit from switching stream sources, or the streaming server is unavailable. Please wait and try again, or pick another episode.',
      };
    }

    return {
      title: 'This player is currently unavailable.',
      subtitle:
        'Please try another episode, change server or provider, or try again later.',
    };
  }, [
    playerShellPending,
    stream.buffering,
    stream.streamUrl,
    stream.resolveAttempted,
    streamHardExhausted,
    anime.error,
  ]);

  const episodesForUi = streamHardExhausted ? [] : anime.episodes;
  const totalEpisodesForUi = streamHardExhausted ? 0 : anime.totalEpisodes;

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
