import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from 'react';

import { computeHasAnyDub } from '@/features/watch/lib/computeHasAnyDub';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import { STORAGE_SERVER_TYPE } from '@/shared/data/servers';
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
}

export function useWatchStreamLang({
  animeId,
  watchStreamProvider,
  episodeId,
  episodes,
  dubFromTv,
  setStreamLangRevision,
}: UseWatchStreamLangInput): UseWatchStreamLangResult {
  const [langState, setLangState] = useState<LangState>({
    animeId,
    activeServerId: '1',
    userChoseDub: false,
  });
  const userChoseDubRef = useRef(false);
  const [revisionBumpKey, setRevisionBumpKey] = useState('');

  if (langState.animeId !== animeId) {
    setLangState({ animeId, activeServerId: '1', userChoseDub: false });
  }

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

  const clampKey = `${watchStreamProvider}:${catalogHasDub}:${episodeHasDubForResolve}:${episodeId}:${langState.activeServerId}:${langState.userChoseDub}`;
  const clampedServerId = clampActiveServerId(
    langState.activeServerId,
    langState.userChoseDub,
    watchStreamProvider,
    catalogHasDub,
    episodeHasDubForResolve,
  );

  if (clampedServerId !== langState.activeServerId) {
    setLangState((prev) => ({
      ...prev,
      activeServerId: clampedServerId,
      userChoseDub: false,
    }));
    if (revisionBumpKey !== clampKey) {
      setRevisionBumpKey(clampKey);
      setStreamLangRevision((n) => n + 1);
    }
  }

  const activeServerId = clampedServerId;

  const resolverLang = useMemo<'sub' | 'dub'>(() => {
    if (watchStreamProvider === 'aniliberty' || watchStreamProvider === 'hikka') return 'sub';
    if (activeServerId !== '2') return 'sub';
    return 'dub';
  }, [watchStreamProvider, activeServerId]);

  const preferredLang = activeServerId === '2' ? 'dub' : 'sub';

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
      userChoseDub: id === '2',
    }));
  }, []);

  const setActiveServerId = useCallback(
    (value: SetStateAction<string | null>) => {
      setLangState((prev) => {
        const next = typeof value === 'function' ? value(prev.activeServerId) : value;
        return { ...prev, activeServerId: next, userChoseDub: next === '2' };
      });
      setStreamLangRevision((n) => n + 1);
    },
    [setStreamLangRevision],
  );

  const onPlaybackLangResolved = useCallback(
    (lang: 'sub' | 'dub') => {
      if (langState.userChoseDub && lang === 'sub') return;
      setActiveServerIdRaw(lang === 'dub' ? '2' : '1');
    },
    [langState.userChoseDub, setActiveServerIdRaw],
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
}
