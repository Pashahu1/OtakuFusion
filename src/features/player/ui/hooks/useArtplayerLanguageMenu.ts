import { useEffect, useRef, useCallback } from 'react';
import type Artplayer from 'artplayer';

import { syncPlayerLanguageMenu } from '../syncPlayerLanguageMenu';
import type { PlayerProps } from '@/shared/types/PlayerTypes';

export interface UseArtplayerLanguageMenuParams {
  artInstanceRef: React.RefObject<Artplayer | null>;
  servers: PlayerProps['servers'];
  activeServerId: PlayerProps['activeServerId'];
  setActiveServerId: PlayerProps['setActiveServerId'];
  watchStreamProvider: PlayerProps['watchStreamProvider'];
  setWatchStreamProvider: PlayerProps['setWatchStreamProvider'];
  anilibertyLanguageMenuEligible: PlayerProps['anilibertyLanguageMenuEligible'];
  hikkaLanguageMenuEligible: PlayerProps['hikkaLanguageMenuEligible'];
}

/**
 * Синхронізація меню мови/провайдера в Artplayer (refs + реакція на зміну eligibility/сервера).
 */
export function useArtplayerLanguageMenu({
  artInstanceRef,
  servers,
  activeServerId,
  setActiveServerId,
  watchStreamProvider,
  setWatchStreamProvider,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
}: UseArtplayerLanguageMenuParams) {
  const serversRef = useRef(servers);
  const activeServerIdRef = useRef(activeServerId);
  const watchStreamProviderRef = useRef(watchStreamProvider);
  const setWatchStreamProviderRef = useRef(setWatchStreamProvider);
  const setActiveServerIdRef = useRef(setActiveServerId);
  const anilibertyEligibleRef = useRef(anilibertyLanguageMenuEligible ?? false);
  const hikkaEligibleRef = useRef(hikkaLanguageMenuEligible ?? false);

  serversRef.current = servers;
  activeServerIdRef.current = activeServerId;
  watchStreamProviderRef.current = watchStreamProvider;

  useEffect(() => {
    watchStreamProviderRef.current = watchStreamProvider;
    setWatchStreamProviderRef.current = setWatchStreamProvider;
    setActiveServerIdRef.current = setActiveServerId;
    anilibertyEligibleRef.current = anilibertyLanguageMenuEligible ?? false;
    hikkaEligibleRef.current = hikkaLanguageMenuEligible ?? false;
  });

  const syncLanguageMenuIfReady = useCallback(() => {
    const art = artInstanceRef.current;
    if (!art) return;
    syncPlayerLanguageMenu(art, {
      serversRef,
      activeServerIdRef,
      watchStreamProvider: watchStreamProviderRef.current,
      setWatchStreamProvider: (next) => setWatchStreamProviderRef.current(next),
      setActiveServerId: (id) => setActiveServerIdRef.current(id),
      anilibertyLanguageMenuEligible: anilibertyEligibleRef.current,
      hikkaLanguageMenuEligible: hikkaEligibleRef.current,
    });
  }, [artInstanceRef]);

  useEffect(() => {
    syncLanguageMenuIfReady();
  }, [
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    watchStreamProvider,
    activeServerId,
    servers,
    syncLanguageMenuIfReady,
  ]);

  return {
    serversRef,
    activeServerIdRef,
    watchStreamProviderRef,
    anilibertyEligibleRef,
    hikkaEligibleRef,
    syncLanguageMenuIfReady,
  };
}
