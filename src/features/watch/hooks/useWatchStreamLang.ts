import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { computeHasAnyDub } from '@/features/watch/lib/computeHasAnyDub';
import { episodeMatchesSelection } from '@/shared/utils/episodeUtils';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import { STORAGE_SERVER_TYPE } from '@/shared/data/servers';

interface UseWatchStreamLangInput {
  animeId: string;
  watchStreamProvider: WatchStreamProvider;
  episodeId: string | null;
  episodes: EpisodesTypes[] | null;
  dubFromTv: number;
  setStreamLangRevision: React.Dispatch<React.SetStateAction<number>>;
}

export interface UseWatchStreamLangResult {
  activeServerId: string | null;
  setActiveServerId: (value: SetStateAction<string | null>) => void;
  setActiveServerIdRaw: (id: string | null) => void;
  servers: ServerInfo[];
  resolverLang: 'sub' | 'dub';
  episodeDubStateKey: string;
  episodeHasDubForResolve: boolean | undefined;
  onPlaybackLangResolved: (lang: 'sub' | 'dub') => void;
  userChoseDubRef: MutableRefObject<boolean>;
}

export function useWatchStreamLang({
  animeId,
  watchStreamProvider,
  episodeId,
  episodes,
  dubFromTv,
  setStreamLangRevision,
}: UseWatchStreamLangInput): UseWatchStreamLangResult {
  const [activeServerId, setActiveServerIdRaw] = useState<string | null>('1');
  const userChoseDubRef = useRef(false);

  useEffect(() => {
    setActiveServerIdRaw('1');
    userChoseDubRef.current = false;
  }, [animeId]);

  const setActiveServerId = useCallback((value: SetStateAction<string | null>) => {
    setActiveServerIdRaw((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      if (next === '2') userChoseDubRef.current = true;
      if (next === '1') userChoseDubRef.current = false;
      return next;
    });
    setStreamLangRevision((n) => n + 1);
  }, [setStreamLangRevision]);

  const catalogHasDub = useMemo(
    () => computeHasAnyDub({ dubFromTv, episodes }),
    [dubFromTv, episodes]
  );

  const selectedEpisode = useMemo(() => {
    if (!episodeId || !episodes?.length) return undefined;
    return episodes.find((e) => episodeMatchesSelection(e, episodeId));
  }, [episodes, episodeId]);

  const resolverLang = useMemo<'sub' | 'dub'>(() => {
    if (watchStreamProvider === 'aniliberty' || watchStreamProvider === 'hikka') return 'sub';
    if (activeServerId !== '2') return 'sub';
    return 'dub';
  }, [watchStreamProvider, activeServerId]);

  const preferredLang = activeServerId === '2' ? 'dub' : 'sub';

  useEffect(() => {
    if (userChoseDubRef.current) return;
    if (watchStreamProvider === 'aniliberty' || watchStreamProvider === 'hikka') {
      if (activeServerId === '2') setActiveServerIdRaw('1');
      return;
    }
    if (!catalogHasDub && activeServerId === '2') {
      setActiveServerIdRaw('1');
    }
  }, [watchStreamProvider, activeServerId, catalogHasDub]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SERVER_TYPE, preferredLang);
  }, [preferredLang]);

  const servers = useMemo<ServerInfo[]>(
    () => [
      { type: 'sub', data_id: 1, server_id: 1, serverName: 'Japanese' },
      { type: 'dub', data_id: 2, server_id: 2, serverName: 'English' },
    ],
    []
  );

  const onPlaybackLangResolved = useCallback((lang: 'sub' | 'dub') => {
    if (userChoseDubRef.current && lang === 'sub') return;
    setActiveServerIdRaw(lang === 'dub' ? '2' : '1');
  }, []);

  const episodeHasDubForResolve = useMemo((): boolean | undefined => {
    if (!selectedEpisode) return undefined;
    if (selectedEpisode.hasDub === true) return true;
    if (selectedEpisode.hasDub === false) return false;
    return undefined;
  }, [selectedEpisode]);

  const episodeDubStateKey = useMemo(
    () =>
      `${episodeId ?? ''}:${selectedEpisode?.hasDub === true ? '1' : '0'}:${catalogHasDub ? '1' : '0'}`,
    [episodeId, selectedEpisode?.hasDub, catalogHasDub]
  );

  useEffect(() => {
    if (watchStreamProvider !== 'animepahe') return;
    if (episodeHasDubForResolve !== false) return;
    userChoseDubRef.current = false;
    setActiveServerIdRaw('1');
    setStreamLangRevision((n) => n + 1);
  }, [watchStreamProvider, episodeHasDubForResolve, episodeId, setStreamLangRevision]);

  return {
    activeServerId,
    setActiveServerId,
    setActiveServerIdRaw,
    servers,
    resolverLang,
    episodeDubStateKey,
    episodeHasDubForResolve,
    onPlaybackLangResolved,
    userChoseDubRef,
  };
}
