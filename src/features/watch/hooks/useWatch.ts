import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  type SetStateAction,
} from 'react';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import { writeWatchStreamProvider } from '@/lib/watch-provider';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import { STORAGE_SERVER_TYPE } from '@/shared/data/servers';
import { useWatchAnime } from './useWatchAnime';
import { useWatchStream, type WatchStreamAnimeMeta } from './useWatchStream';

export function useWatch(
  animeId: string,
  initialEpisodeId: string | undefined
): UseWatchReturn {
  const [isFullOverview, setIsFullOverview] = useState(false);
  const [streamRecoveryNonce, setStreamRecoveryNonce] = useState(0);
  const [streamLangRevision, setStreamLangRevision] = useState(0);
  const [watchStreamProvider, setWatchStreamProviderState] =
    useState<WatchStreamProvider>('animepahe');

  const setWatchStreamProvider = useCallback((next: WatchStreamProvider) => {
    setWatchStreamProviderState(next);
    writeWatchStreamProvider(next);
  }, []);

  /** Новий тайтл — завжди Animepahe; Anilibria лише після явного вибору в плеєрі. */
  useEffect(() => {
    setStreamRecoveryNonce(0);
    if (!animeId.trim()) return;
    setWatchStreamProvider('animepahe');
  }, [animeId, setWatchStreamProvider]);

  const anime = useWatchAnime(animeId, initialEpisodeId, watchStreamProvider);

  const playerShellPending =
    anime.animeInfoLoading ||
    anime.episodes === null ||
    (anime.episodeId == null &&
      Array.isArray(anime.episodes) &&
      anime.episodes.length > 0) ||
    (Boolean(anime.episodeId) &&
      Array.isArray(anime.episodes) &&
      anime.episodes.length > 0 &&
      anime.episodes.every(
        (e: EpisodesTypes) => getEpisodeNumberFromId(e.id) !== anime.episodeId
      ));

  const [activeServerId, setActiveServerIdRaw] = useState<string | null>('2');

  useEffect(() => {
    setActiveServerIdRaw('2');
  }, [animeId]);

  const setActiveServerId = useCallback((value: SetStateAction<string | null>) => {
    setActiveServerIdRaw(value);
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

  const hasAnyDub = useMemo(
    () => Boolean(anime.episodes?.some((e) => e.hasDub === true)),
    [anime.episodes]
  );

  const currentEpisodeHasDub = useMemo(() => {
    const ep = anime.episodes?.find(
      (e: EpisodesTypes) => getEpisodeNumberFromId(e.id) === anime.episodeId
    );
    return ep?.hasDub === true;
  }, [anime.episodes, anime.episodeId]);

  /** Мова для `watch/resolve`: Anilibria лише саб; dub лише якщо є доріжка на епізоді. */
  const resolverLang = useMemo<'sub' | 'dub'>(() => {
    if (watchStreamProvider === 'aniliberty') return 'sub';
    if (activeServerId !== '2') return 'sub';
    if (!hasAnyDub) return 'sub';
    if (currentEpisodeHasDub === false) return 'sub';
    return 'dub';
  }, [watchStreamProvider, activeServerId, hasAnyDub, currentEpisodeHasDub]);

  const preferredLang = useMemo<'sub' | 'dub'>(
    () => (activeServerId === '2' ? 'dub' : 'sub'),
    [activeServerId]
  );

  /** Dub / Anilibria: один прохід без «другого редіректу» — лише `setActiveServerIdRaw`, без `streamLangRevision`. */
  useEffect(() => {
    if (watchStreamProvider === 'aniliberty') {
      if (activeServerId === '2') setActiveServerIdRaw('1');
      return;
    }
    if (!hasAnyDub && activeServerId === '2') {
      setActiveServerIdRaw('1');
      return;
    }
    if (activeServerId === '2' && anime.episodeId && currentEpisodeHasDub === false) {
      setActiveServerIdRaw('1');
    }
  }, [
    watchStreamProvider,
    activeServerId,
    hasAnyDub,
    anime.episodeId,
    currentEpisodeHasDub,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SERVER_TYPE, preferredLang);
  }, [preferredLang]);

  /** Завжди ті самі «дзеркала» для меню мови; Anilibria — окремий провайдер у `setupPlayerReady`. */
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
    setActiveServerIdRaw(lang === 'dub' ? '2' : '1');
  }, []);

  const episodeDubStateKey = useMemo(
    () =>
      `${anime.episodeId ?? ''}:${
        currentEpisodeHasDub === true ? '1' : '0'
      }:${hasAnyDub ? '1' : '0'}`,
    [anime.episodeId, currentEpisodeHasDub, hasAnyDub]
  );

  const watchResolveOptions = useMemo(
    () => ({
      animeId,
      episodeId: anime.episodeId,
      streamAnime: streamAnimeMeta,
      providerAnimeId:
        watchStreamProvider === 'aniliberty'
          ? anime.anilibertyCatalogProviderId
          : anime.animepaheCatalogProviderId,
      preferredLang: resolverLang,
      onPlaybackLangResolved,
      watchStreamProvider,
      streamRecoveryNonce,
      streamLangRevision,
      episodeDubStateKey,
    }),
    [
      streamAnimeMeta,
      anime.episodeId,
      anime.animepaheCatalogProviderId,
      anime.anilibertyCatalogProviderId,
      animeId,
      watchStreamProvider,
      resolverLang,
      onPlaybackLangResolved,
      streamRecoveryNonce,
      streamLangRevision,
      episodeDubStateKey,
    ]
  );

  const stream = useWatchStream(watchResolveOptions);

  const onStreamRecoveryChoice = useCallback(
    (choice: 'japanese' | 'english') => {
      if (choice === 'english' && !hasAnyDub) return;
      setWatchStreamProvider('animepahe');
      setActiveServerIdRaw(choice === 'english' ? '2' : '1');
      setStreamLangRevision((n) => n + 1);
      setStreamRecoveryNonce((n) => n + 1);
    },
    [hasAnyDub, setWatchStreamProvider]
  );

  const showStreamRecovery = useMemo(
    () =>
      stream.resolveAttempted &&
      !anime.error &&
      !playerShellPending &&
      !stream.buffering &&
      !stream.streamUrl &&
      Boolean(anime.episodes?.length),
    [
      stream.resolveAttempted,
      anime.error,
      playerShellPending,
      stream.buffering,
      stream.streamUrl,
      anime.episodes,
    ]
  );

  const activeEpisodeNum = useMemo((): number | null => {
    const { episodes, episodeId } = anime;
    if (!episodes?.length || !episodeId) return null;
    const ep = episodes.find(
      (e: EpisodesTypes) => getEpisodeNumberFromId(e.id) === episodeId
    );
    return ep?.episode_no ?? null;
  }, [anime.episodes, anime.episodeId]);

  const error = anime.error ?? stream.error ?? null;

  return {
    error,
    buffering: stream.buffering,
    streamInfo: stream.streamInfo,
    animeInfo: anime.animeInfo,
    episodes: anime.episodes,
    nextEpisodeSchedule: anime.nextEpisodeSchedule,
    animeInfoLoading: anime.animeInfoLoading,
    playerShellPending,
    totalEpisodes: anime.totalEpisodes,
    servers,
    streamUrl: stream.streamUrl,
    isFullOverview,
    setIsFullOverview,
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
    showStreamRecovery,
    onStreamRecoveryChoice,
    anilibertyLanguageMenuEligible: anime.anilibertyLanguageMenuEligible,
  };
}
