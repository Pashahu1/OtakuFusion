import { useState, useMemo, useEffect, useCallback } from 'react';
import { getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import { STORAGE_SERVER_TYPE } from '@/shared/data/servers';
import { useWatchAnime } from './useWatchAnime';
import { useWatchStream } from './useWatchStream';

/**
 * Сторінка watch: композиція `useWatchAnime` + `useWatchStream`.
 */
export function useWatch(
  animeId: string,
  initialEpisodeId: string | undefined
): UseWatchReturn {
  const [isFullOverview, setIsFullOverview] = useState(false);

  const anime = useWatchAnime(animeId, initialEpisodeId);

  const playerShellPending =
    anime.animeInfoLoading ||
    anime.episodes === null ||
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
  const [prevAnimeId, setPrevAnimeId] = useState(animeId);
  if (animeId !== prevAnimeId) {
    setPrevAnimeId(animeId);
    /**
     * Новий тайтл — підтягуємо глобальний вибір (Sub/Dub) з localStorage без setState в ефекті.
     */
    setActiveServerId(getPersistedServerId());
  }

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
      animeInfo: anime.animeInfo,
      providerAnimeId: anime.providerAnimeId,
      preferredLang,
      onPlaybackLangResolved,
    }),
    [
      anime.animeInfo,
      anime.episodeId,
      anime.providerAnimeId,
      animeId,
      preferredLang,
      onPlaybackLangResolved,
    ]
  );

  const stream = useWatchStream(watchResolveOptions);

  const activeEpisodeNum = useMemo((): number | null => {
    const { episodes, episodeId } = anime;
    if (!episodes?.length || !episodeId) return null;
    const ep = episodes.find(
      (e: EpisodesTypes) => getEpisodeNumberFromId(e.id) === episodeId
    );
    return ep?.episode_no ?? null;
  }, [anime.episodes, anime.episodeId]);

  const error =
    anime.error ?? stream.error ?? null;

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
    intro: stream.intro,
    outro: stream.outro,
    episodeId: anime.episodeId,
    setEpisodeId: anime.setEpisodeId,
    activeEpisodeNum,
    activeServerId,
    setActiveServerId,
  };
}
