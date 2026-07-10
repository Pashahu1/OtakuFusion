'use client';

import { useEffect, useRef, useCallback } from 'react';
import type Artplayer from 'artplayer';

import { syncPlayerLanguageMenu } from '../syncPlayerLanguageMenu';
import type { PlayerProps } from '@/shared/types/PlayerTypes';
import type { ContinueWatchingProgress } from '../updateContinueWatching';
import { setPendingPlaybackResume } from '@/features/watch/lib/playback-resume-pending';
import { normalizeEpisodeStorageKey } from '@/shared/utils/episodeUtils';

export interface UseArtplayerLanguageMenuParams {
  artInstanceRef: React.RefObject<Artplayer | null>;
  servers: PlayerProps['servers'];
  activeServerId: PlayerProps['activeServerId'];
  setActiveServerId: PlayerProps['setActiveServerId'];
  watchStreamProvider: PlayerProps['watchStreamProvider'];
  setWatchStreamProvider: PlayerProps['setWatchStreamProvider'];
  anilibertyLanguageMenuEligible: PlayerProps['anilibertyLanguageMenuEligible'];
  hikkaLanguageMenuEligible: PlayerProps['hikkaLanguageMenuEligible'];
  anikotoLanguageMenuEligible: PlayerProps['anikotoLanguageMenuEligible'];
  resolvedStreamLang?: 'sub' | 'dub' | null;
  animeId: string | null | undefined;
  episodeId: PlayerProps['episodeId'];
  episodeNum?: number | null;
  onLanguageSwitchResume: (
    progress: ContinueWatchingProgress,
  ) => void;
}

/** Sync Artplayer Language menu when provider / server / eligibility changes. */
export function useArtplayerLanguageMenu({
  artInstanceRef,
  servers,
  activeServerId,
  setActiveServerId,
  watchStreamProvider,
  setWatchStreamProvider,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
  anikotoLanguageMenuEligible,
  resolvedStreamLang,
  animeId,
  episodeId,
  episodeNum,
  onLanguageSwitchResume,
}: UseArtplayerLanguageMenuParams) {
  const serversRef = useRef(servers);
  const activeServerIdRef = useRef(activeServerId);
  const watchStreamProviderRef = useRef(watchStreamProvider);
  const setWatchStreamProviderRef = useRef(setWatchStreamProvider);
  const setActiveServerIdRef = useRef(setActiveServerId);
  const anilibertyEligibleRef = useRef(anilibertyLanguageMenuEligible ?? false);
  const hikkaEligibleRef = useRef(hikkaLanguageMenuEligible ?? false);
  const anikotoEligibleRef = useRef(anikotoLanguageMenuEligible ?? false);
  const resolvedStreamLangRef = useRef(resolvedStreamLang ?? null);
  const onLanguageSwitchResumeRef = useRef(onLanguageSwitchResume);
  const animeIdRef = useRef(animeId);
  const episodeIdRef = useRef(episodeId);
  const episodeNumRef = useRef(episodeNum);

  useEffect(() => {
    onLanguageSwitchResumeRef.current = onLanguageSwitchResume;
    animeIdRef.current = animeId;
    episodeIdRef.current = episodeId;
    episodeNumRef.current = episodeNum;
  }, [onLanguageSwitchResume, animeId, episodeId, episodeNum]);

  useEffect(() => {
    serversRef.current = servers;
    activeServerIdRef.current = activeServerId;
    watchStreamProviderRef.current = watchStreamProvider;
    setWatchStreamProviderRef.current = setWatchStreamProvider;
    setActiveServerIdRef.current = setActiveServerId;
    anilibertyEligibleRef.current = anilibertyLanguageMenuEligible ?? false;
    hikkaEligibleRef.current = hikkaLanguageMenuEligible ?? false;
    anikotoEligibleRef.current = anikotoLanguageMenuEligible ?? false;
    resolvedStreamLangRef.current = resolvedStreamLang ?? null;
  }, [
    servers,
    activeServerId,
    watchStreamProvider,
    setWatchStreamProvider,
    setActiveServerId,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    resolvedStreamLang,
  ]);

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
      anikotoLanguageMenuEligible: anikotoEligibleRef.current,
      resolvedStreamLang: resolvedStreamLangRef.current,
      onBeforeLanguageSwitch: (player) => {
        const current = player.currentTime;
        if (!Number.isFinite(current) || current < 3) return null;

        const positionSeconds = Math.floor(current);
        const duration = player.duration;
        const durationSeconds =
          Number.isFinite(duration) && duration > 0 ? Math.floor(duration) : undefined;

        const progress: ContinueWatchingProgress = {
          positionSeconds,
          durationSeconds: durationSeconds ?? positionSeconds,
        };

        onLanguageSwitchResumeRef.current(progress);

        const id = animeIdRef.current?.trim();
        const epKey = normalizeEpisodeStorageKey(
          episodeIdRef.current,
          episodeNumRef.current,
        );
        if (id && epKey) {
          setPendingPlaybackResume(id, epKey, positionSeconds);
        }

        return progress;
      },
    });
  }, [artInstanceRef]);

  useEffect(() => {
    syncLanguageMenuIfReady();
  }, [
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    watchStreamProvider,
    activeServerId,
    resolvedStreamLang,
    servers,
    syncLanguageMenuIfReady,
  ]);

  return { syncLanguageMenuIfReady, anilibertyEligibleRef, hikkaEligibleRef };
}
