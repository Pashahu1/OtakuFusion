import { useState, useMemo, useEffect, useCallback } from 'react';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import { readWatchStreamProvider, writeWatchStreamProvider } from '@/lib/watch-provider';
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
  const [watchStreamProvider, setWatchStreamProviderState] =
    useState<WatchStreamProvider>('animepahe');

  useEffect(() => {
    setWatchStreamProviderState(readWatchStreamProvider());
  }, []);

  useEffect(() => {
    setStreamRecoveryNonce(0);
  }, [animeId]);

  const setWatchStreamProvider = useCallback((next: WatchStreamProvider) => {
    setWatchStreamProviderState(next);
    writeWatchStreamProvider(next);
  }, []);

  const anime = useWatchAnime(animeId, initialEpisodeId);

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

  function getPersistedServerId(): string {
    if (typeof window === 'undefined') return '2';
    const savedType = localStorage.getItem(STORAGE_SERVER_TYPE)?.toLowerCase();
    return savedType === 'sub' ? '1' : '2';
  }

  const [activeServerId, setActiveServerId] = useState<string | null>(() =>
    getPersistedServerId()
  );

  useEffect(() => {
    setActiveServerId(getPersistedServerId());
  }, [animeId]);

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

  const preferredLang = useMemo<'sub' | 'dub'>(
    () => (activeServerId === '2' ? 'dub' : 'sub'),
    [activeServerId]
  );

  const currentEpisodeHasDub = useMemo(() => {
    const ep = anime.episodes?.find(
      (e: EpisodesTypes) => getEpisodeNumberFromId(e.id) === anime.episodeId
    );
    return ep?.hasDub === true;
  }, [anime.episodes, anime.episodeId]);

  useEffect(() => {
    if (!hasAnyDub && activeServerId === '2') {
      setActiveServerId('1');
    }
  }, [hasAnyDub, activeServerId]);

  useEffect(() => {
    if (activeServerId === '2' && anime.episodeId && currentEpisodeHasDub === false) {
      setActiveServerId('1');
    }
  }, [activeServerId, anime.episodeId, currentEpisodeHasDub]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SERVER_TYPE, preferredLang);
  }, [preferredLang]);

  const servers = useMemo<ServerInfo[]>(() => {
    const base: ServerInfo[] = [
      { type: 'sub', data_id: 1, server_id: 1, serverName: 'Sub · Auto' },
    ];
    if (hasAnyDub) {
      base.push({ type: 'dub', data_id: 2, server_id: 2, serverName: 'Dub · Auto' });
    }
    return base;
  }, [hasAnyDub]);

  const onPlaybackLangResolved = useCallback((lang: 'sub' | 'dub') => {
    setActiveServerId(lang === 'dub' ? '2' : '1');
  }, []);

  const watchResolveOptions = useMemo(
    () => ({
      animeId,
      episodeId: anime.episodeId,
      streamAnime: streamAnimeMeta,
      providerAnimeId: anime.providerAnimeId,
      preferredLang,
      onPlaybackLangResolved,
      watchStreamProvider,
      streamRecoveryNonce,
    }),
    [
      streamAnimeMeta,
      anime.episodeId,
      anime.providerAnimeId,
      animeId,
      preferredLang,
      onPlaybackLangResolved,
      watchStreamProvider,
      streamRecoveryNonce,
    ]
  );

  const stream = useWatchStream(watchResolveOptions);

  const onStreamRecoveryChoice = useCallback(
    (choice: 'japanese' | 'english') => {
      if (choice === 'english' && !hasAnyDub) return;
      setWatchStreamProvider('animepahe');
      setActiveServerId(choice === 'english' ? '2' : '1');
      setStreamRecoveryNonce((n) => n + 1);
    },
    [hasAnyDub, setWatchStreamProvider, setActiveServerId]
  );

  const showStreamRecovery = useMemo(
    () =>
      !anime.error &&
      !playerShellPending &&
      !stream.buffering &&
      !stream.streamUrl &&
      Boolean(anime.episodes?.length),
    [
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
  };
}
