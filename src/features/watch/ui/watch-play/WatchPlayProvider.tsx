'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useWatchPlayPage } from '@/features/watch/hooks/useWatchPlayPage';
import type { UseWatchReturn } from '@/shared/types/UseWatchReturn';

interface WatchPlayContextValue {
  animeId: string;
  watch: UseWatchReturn;
  watchedEpisodes: Record<string, boolean>;
  onEpisodeWatched: (episodeId: string) => void;
  showErrorBlock: boolean;
}

const WatchPlayContext = createContext<WatchPlayContextValue | null>(null);

export function WatchPlayProvider({
  children,
  animeId,
}: {
  children: ReactNode;
  animeId: string;
}) {
  const value = useWatchPlayPage(animeId);
  return (
    <WatchPlayContext.Provider value={value}>
      {children}
    </WatchPlayContext.Provider>
  );
}

export function useWatchPlay(): WatchPlayContextValue {
  const ctx = useContext(WatchPlayContext);
  if (!ctx) {
    throw new Error('useWatchPlay must be used within WatchPlayProvider');
  }
  return ctx;
}
