import { useCallback, useEffect, useState } from 'react';

export type PlayerMode = 'builtin' | 'external';

const STORAGE_KEY = 'player_mode';
const DEFAULT_MODE: PlayerMode = 'builtin';

function readStoredMode(): PlayerMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === 'external' ? 'external' : 'builtin';
}

export interface UsePlayerModeReturn {
  mode: PlayerMode;
  setMode: (mode: PlayerMode) => void;
  toggleMode: () => void;
}

export function usePlayerMode(): UsePlayerModeReturn {
  const [mode, setModeState] = useState<PlayerMode>(DEFAULT_MODE);

  useEffect(() => {
    setModeState(readStoredMode());
  }, []);

  const setMode = useCallback((next: PlayerMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: PlayerMode = prev === 'builtin' ? 'external' : 'builtin';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, []);

  return { mode, setMode, toggleMode };
}
