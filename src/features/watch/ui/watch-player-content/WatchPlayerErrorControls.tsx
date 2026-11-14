'use client';

import { useTranslation } from 'react-i18next';

import type { WatchPlaybackAudio } from '@/features/watch/lib/playback-audio';
import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { buildFlatLanguageMenu } from '@/features/player/ui/language-menu/buildFlatLanguageMenu';
import { applyLanguageTrack } from '@/features/player/ui/netflix-tracks/applyLanguageTrack';

interface WatchPlayerErrorControlsProps {
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  setActiveServerId: (id: string | null) => void;
  playbackAudio: WatchPlaybackAudio;
  setPlaybackAudio: (next: WatchPlaybackAudio) => void;
  hikkaLanguageMenuEligible: boolean;
  anikotoJapaneseEligible: boolean;
  anikotoEnglishEligible: boolean;
}

export function WatchPlayerErrorControls({
  setWatchStreamProvider,
  setActiveServerId,
  playbackAudio,
  setPlaybackAudio,
  hikkaLanguageMenuEligible,
  anikotoJapaneseEligible,
  anikotoEnglishEligible,
}: WatchPlayerErrorControlsProps) {
  const { t } = useTranslation('common');
  const options = buildFlatLanguageMenu({
    playbackAudio,
    hikkaLanguageMenuEligible,
    anikotoJapaneseEligible,
    anikotoEnglishEligible,
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
              applyLanguageTrack(item as unknown as Record<string, unknown>, {
                setWatchStreamProvider,
                setActiveServerId,
                setPlaybackAudio,
              })
            }
          >
            {item.html}
          </button>
        );
      })}
    </div>
  );
}
