import type Artplayer from 'artplayer';

import type { WatchPlaybackAudio } from '@/features/watch/lib/playback-audio';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import { hardStopWatchPlayerSurface } from './hooks/artplayer-hls/hardStopPlayerMedia';
import { applyLanguageTrack } from './netflix-tracks/applyLanguageTrack';
import { patchTracksPanelModel } from './netflix-tracks/tracksPanelModel';
import { buildFlatLanguageMenu } from './language-menu/buildFlatLanguageMenu';

export interface LanguageSwitchResumeContext {
  positionSeconds: number;
  durationSeconds?: number;
}

export interface SyncPlayerLanguageMenuParams {
  serversRef: React.RefObject<ServerInfo[] | null>;
  activeServerIdRef: React.RefObject<string | null>;
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  setActiveServerId: (id: string | null) => void;
  setPlaybackAudio: (next: WatchPlaybackAudio) => void;
  playbackAudio: WatchPlaybackAudio;
  hikkaLanguageMenuEligible: boolean;
  anikotoJapaneseEligible: boolean;
  anikotoEnglishEligible: boolean;
  resolvedStreamLang?: 'sub' | 'dub' | null;
  onBeforeLanguageSwitch?: (art: Artplayer) => LanguageSwitchResumeContext | null;
}

export function syncPlayerLanguageMenu(
  art: Artplayer,
  params: SyncPlayerLanguageMenuParams,
): void {
  const {
    setWatchStreamProvider,
    setActiveServerId,
    setPlaybackAudio,
    playbackAudio,
    hikkaLanguageMenuEligible,
    anikotoJapaneseEligible,
    anikotoEnglishEligible,
    onBeforeLanguageSwitch,
  } = params;

  try {
    (art.setting as { hide?: () => void }).hide?.();
  } catch {
    /* panel may be closed */
  }

  try {
    art.setting.remove('language');
  } catch {
    /* setting may not exist yet */
  }

  const menuInput = {
    playbackAudio,
    hikkaLanguageMenuEligible,
    anikotoJapaneseEligible,
    anikotoEnglishEligible,
  };

  const flatLanguage = buildFlatLanguageMenu(menuInput);

  patchTracksPanelModel(art, {
    audio: flatLanguage.map((item) => ({
      id: String(item.__mode ?? item.html),
      label: item.html,
      active: Boolean(item.default),
      payload: item as unknown as Record<string, unknown>,
    })),
    onSelectAudio: (id) => {
      const item = flatLanguage.find(
        (entry) => String(entry.__mode ?? entry.html) === id,
      );
      if (!item) return;
      onBeforeLanguageSwitch?.(art);
      const container = art.template?.$player ?? null;
      hardStopWatchPlayerSurface(
        art,
        container instanceof HTMLDivElement ? container : null,
      );
      applyLanguageTrack(item as unknown as Record<string, unknown>, {
        setWatchStreamProvider,
        setActiveServerId,
        setPlaybackAudio,
      });
    },
  });
}
