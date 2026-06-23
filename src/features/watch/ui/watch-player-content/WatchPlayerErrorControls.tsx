'use client';

import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import {
  buildFlatLanguageMenu,
  type LangMenuLeaf,
} from '@/features/player/ui/language-menu/buildFlatLanguageMenu';
import { STORAGE_SERVER_TYPE } from '@/shared/data/servers';

interface WatchPlayerErrorControlsProps {
  activeServerId: string | null;
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  setActiveServerId: (id: string | null) => void;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
}

function applyLanguageMenuSelection(
  item: LangMenuLeaf,
  setWatchStreamProvider: (next: WatchStreamProvider) => void,
  setActiveServerId: (id: string | null) => void,
): void {
  const mode = item.__mode;

  if (mode === 'aniliberty') {
    setWatchStreamProvider('aniliberty');
    try {
      localStorage.setItem(STORAGE_SERVER_TYPE, 'sub');
      localStorage.removeItem('server_name');
    } catch {
      /* ignore */
    }
    return;
  }

  if (mode === 'hikka') {
    setWatchStreamProvider('hikka');
    try {
      localStorage.setItem(STORAGE_SERVER_TYPE, 'sub');
      localStorage.removeItem('server_name');
    } catch {
      /* ignore */
    }
    return;
  }

  if (mode === 'anikoto-sub') {
    setWatchStreamProvider('anikoto');
    setActiveServerId('1');
    try {
      localStorage.setItem(STORAGE_SERVER_TYPE, 'sub');
      localStorage.removeItem('server_name');
    } catch {
      /* ignore */
    }
    return;
  }

  if (mode === 'anikoto-dub') {
    setWatchStreamProvider('anikoto');
    setActiveServerId('2');
    try {
      localStorage.setItem(STORAGE_SERVER_TYPE, 'dub');
      localStorage.removeItem('server_name');
    } catch {
      /* ignore */
    }
  }
}

export function WatchPlayerErrorControls({
  activeServerId,
  watchStreamProvider,
  setWatchStreamProvider,
  setActiveServerId,
  anilibertyLanguageMenuEligible,
  hikkaLanguageMenuEligible,
  anikotoLanguageMenuEligible,
}: WatchPlayerErrorControlsProps) {
  const anikotoActiveLang =
    watchStreamProvider === 'anikoto' ? (activeServerId === '2' ? 'dub' : 'sub') : null;

  const options = buildFlatLanguageMenu({
    watchStreamProvider,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    anikotoActiveLang,
  });

  if (options.length === 0) return null;

  return (
    <div className="watch-player-content__error-controls" role="group" aria-label="Stream language">
      {options.map((item) => {
        const isActive = item.default === true;
        return (
          <button
            key={item.__mode ?? item.html}
            type="button"
            className={
              isActive
                ? 'watch-player-content__error-control watch-player-content__error-control--active'
                : 'watch-player-content__error-control'
            }
            onClick={() =>
              applyLanguageMenuSelection(item, setWatchStreamProvider, setActiveServerId)
            }
          >
            {item.html}
          </button>
        );
      })}
    </div>
  );
}
