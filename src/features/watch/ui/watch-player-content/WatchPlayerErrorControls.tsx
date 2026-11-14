'use client';

import { useTranslation } from 'react-i18next';

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
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
}

function applyLanguageMenuSelection(
  item: LangMenuLeaf,
  setWatchStreamProvider: (next: WatchStreamProvider) => void,
  setActiveServerId: (id: string | null) => void,
): void {
  const mode = item.__mode;

  if (mode === 'hikka') {
    setWatchStreamProvider('hikka');
    try {
      localStorage.setItem(STORAGE_SERVER_TYPE, 'sub');
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
  hikkaLanguageMenuEligible,
}: WatchPlayerErrorControlsProps) {
  const { t } = useTranslation('common');
  const options = buildFlatLanguageMenu({
    watchStreamProvider,
    hikkaLanguageMenuEligible,
  });

  if (options.length === 0) return null;

  return (
    <div
      className="watch-player-content__error-controls"
      role="group"
      aria-label={t('watch.streamLanguage')}
    >
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
