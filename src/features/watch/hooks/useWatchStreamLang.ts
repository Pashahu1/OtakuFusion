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
  userChoseDub: boolean;
  userChoseDubRef: MutableRefObject<boolean>;
}

interface LangState {
  animeId: string;
  activeServerId: string | null;
  userChoseDub: boolean;
}

function clampServerId(
  id: string | null,
  userChoseDub: boolean,
  watchStreamProvider: WatchStreamProvider,
  catalogHasDub: boolean,
  episodeHasDubForResolve: boolean | undefined,
): string | null {
  if (userChoseDub) return id;
  if (watchStreamProvider === 'aniliberty' || watchStreamProvider === 'hikka') {
    return id === '2' ? '1' : id;
  }
  if (!catalogHasDub && id === '2') return '1';
  if (watchStreamProvider === 'animepahe' && episodeHasDubForResolve === false && id === '2') {
    return '1';
  }
  return id;
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
  const clampedServerId = clampServerId(
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
