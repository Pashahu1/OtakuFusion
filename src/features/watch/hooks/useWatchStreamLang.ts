import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react';

import { computeHasAnyDub } from '@/features/watch/lib/computeHasAnyDub';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import {
  isWatchDubServerId,
  STORAGE_SERVER_TYPE,
  watchServerIdFromLang,
} from '@/shared/data/servers';
import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';

import { clampActiveServerId } from './watch-stream-lang/clampActiveServerId';
import type { LangState, UseWatchStreamLangResult } from './watch-stream-lang/watchStreamLangTypes';

export type { UseWatchStreamLangResult } from './watch-stream-lang/watchStreamLangTypes';

interface UseWatchStreamLangInput {
  animeId: string;
  watchStreamProvider: WatchStreamProvider;
  episodeId: string | null;
  episodes: EpisodesTypes[] | null;
  dubFromTv: number;
  setStreamLangRevision: React.Dispatch<React.SetStateAction<number>>;
  initialStreamLang?: 'sub' | 'dub';
}

export function useWatchStreamLang({
  animeId,
  watchStreamProvider,
  episodeId,
  episodes,
  dubFromTv,
  setStreamLangRevision,
  initialStreamLang,
}: UseWatchStreamLangInput): UseWatchStreamLangResult {
  const [langState, setLangState] = useState<LangState>(() => ({
    animeId,
    activeServerId: watchServerIdFromLang(initialStreamLang === 'dub' ? 'dub' : 'sub'),
    userChoseDub: initialStreamLang === 'dub',
  }));
  const userChoseDubRef = useRef(false);
  const hydratedContinueLangRef = useRef<boolean>(false);

  useEffect(() => {
    hydratedContinueLangRef.current = false;
    setLangState({
      animeId,
      activeServerId: watchServerIdFromLang(initialStreamLang === 'dub' ? 'dub' : 'sub'),
      userChoseDub: initialStreamLang === 'dub',
    });
  }, [animeId, initialStreamLang]);

  useEffect(() => {
    if (!initialStreamLang) return;
    if (hydratedContinueLangRef.current) return;
    if (langState.animeId !== animeId) return;
    const targetId = watchServerIdFromLang(initialStreamLang);
    hydratedContinueLangRef.current = true;

    setLangState((prev) => {
      if (prev.activeServerId === targetId) return prev;
      return {
        ...prev,
        activeServerId: targetId,
        userChoseDub: initialStreamLang === 'dub',
      };
    });
  }, [animeId, initialStreamLang, langState.animeId]);

  useEffect(() => {
    userChoseDubRef.current = langState.userChoseDub;
  }, [langState.userChoseDub]);

  const catalogHasDub = useMemo(
    () => computeHasAnyDub({ dubFromTv, episodes }),
    [dubFromTv, episodes],
  );

  const selectedEpisode = useMemo(() => {
    if (!episodeId || !episodes?.length) return undefined;
    return episodes.find((e) => episodeMatchesSelection(e, episodeId));
  }, [episodes, episodeId]);

  const episodeHasDubForResolve = useMemo((): boolean | undefined => {
    if (!selectedEpisode) return undefined;
    if (selectedEpisode.hasDub === true) return true;
    if (selectedEpisode.hasDub === false) return false;
    return undefined;
  }, [selectedEpisode]);

  const clampedServerId = clampActiveServerId(
    langState.activeServerId,
    langState.userChoseDub,
    watchStreamProvider,
    catalogHasDub,
    episodeHasDubForResolve,
  );

  const activeServerId = clampedServerId;
  const prevClampedRef = useRef(clampedServerId);

  useEffect(() => {
    if (clampedServerId === langState.activeServerId) return;
    setLangState((prev) => ({
      ...prev,
      activeServerId: clampedServerId,
      userChoseDub: false,
    }));
  }, [clampedServerId, langState.activeServerId]);

  useEffect(() => {
    if (prevClampedRef.current === clampedServerId) return;
    prevClampedRef.current = clampedServerId;
    setStreamLangRevision((n) => n + 1);
  }, [clampedServerId, setStreamLangRevision]);

  const resolverLang = useMemo<'sub' | 'dub'>(() => {
    if (watchStreamProvider === 'aniliberty' || watchStreamProvider === 'hikka') return 'sub';
    if (watchStreamProvider === 'anikoto') {
      return isWatchDubServerId(activeServerId) ? 'dub' : 'sub';
    }
    if (!isWatchDubServerId(activeServerId)) return 'sub';
    return 'dub';
  }, [watchStreamProvider, activeServerId]);

  const preferredLang = isWatchDubServerId(activeServerId) ? 'dub' : 'sub';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SERVER_TYPE, preferredLang);
  }, [preferredLang]);

  const servers = useMemo<ServerInfo[]>(
    () => [
      { type: 'sub', data_id: 1, server_id: 1, serverName: 'Japanese' },
      { type: 'dub', data_id: 2, server_id: 2, serverName: 'English' },
    ],
    [],
  );

  const setActiveServerIdRaw = useCallback((id: string | null) => {
    setLangState((prev) => ({
      ...prev,
      activeServerId: id,
      userChoseDub: isWatchDubServerId(id),
    }));
  }, []);

  const setActiveServerId = useCallback(
    (value: SetStateAction<string | null>) => {
      setLangState((prev) => {
        const next = typeof value === 'function' ? value(prev.activeServerId) : value;
        return { ...prev, activeServerId: next, userChoseDub: isWatchDubServerId(next) };
      });
      setStreamLangRevision((n) => n + 1);
    },
    [setStreamLangRevision],
  );

  const onPlaybackLangResolved = useCallback(
    (lang: 'sub' | 'dub') => {
      setActiveServerIdRaw(watchServerIdFromLang(lang));
    },
    [setActiveServerIdRaw],
  );

  const episodeDubStateKey = useMemo(
    () =>
      `${episodeId ?? ''}:${selectedEpisode?.hasDub === true ? '1' : '0'}:${catalogHasDub ? '1' : '0'}`,
    [episodeId, selectedEpisode?.hasDub, catalogHasDub],
  );

  return {
    activeServerId,
    setActiveServerId,
    setActiveServerIdRaw,
    servers,
    resolverLang,
    episodeDubStateKey,
    episodeHasDubForResolve,
    onPlaybackLangResolved,
    userChoseDub: langState.userChoseDub,
    userChoseDubRef,
  };
};
