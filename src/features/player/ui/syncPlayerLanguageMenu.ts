import type Artplayer from 'artplayer';

import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

import { hardStopWatchPlayerSurface } from './hooks/artplayer-hls/hardStopPlayerMedia';
import {
  buildFlatLanguageMenu,
  languageMenuTooltip,
} from './language-menu/buildFlatLanguageMenu';
import { serverIcon } from './PlayerIcons';

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
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  onBeforeLanguageSwitch?: (art: Artplayer) => LanguageSwitchResumeContext | null;
}

export function syncPlayerLanguageMenu(
  art: Artplayer,
  params: SyncPlayerLanguageMenuParams,
): void {
  const {
    activeServerIdRef,
    watchStreamProvider,
    setWatchStreamProvider,
    setActiveServerId,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    onBeforeLanguageSwitch,
  } = params;

  try {
    art.setting.remove('language');
  } catch {
    /* setting may not exist yet */
  }

  const anikotoActiveLang =
    watchStreamProvider === 'anikoto'
      ? activeServerIdRef.current === '2'
        ? 'dub'
        : 'sub'
      : null;

  const flatLanguage = buildFlatLanguageMenu({
    watchStreamProvider,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    anikotoActiveLang,
  });

  if (flatLanguage.length === 0) return;

  const langTooltip = languageMenuTooltip({
    watchStreamProvider,
    hikkaLanguageMenuEligible,
    anilibertyLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    anikotoActiveLang,
  });

  art.setting.add({
    name: 'language',
    icon: serverIcon,
    html: 'Language',
    tooltip: langTooltip,
    position: 'right',
    selector: flatLanguage,
    onSelect: function (item: Record<string, unknown>) {
      const mode = item.__mode;
      onBeforeLanguageSwitch?.(art);
      const container = art.template?.$player ?? null;
      hardStopWatchPlayerSurface(
        art,
        container instanceof HTMLDivElement ? container : null,
      );

      if (mode === 'aniliberty') {
        setWatchStreamProvider('aniliberty');
        try {
          localStorage.setItem('server_type', 'sub');
          localStorage.removeItem('server_name');
        } catch {
          /* ignore */
        }
        return typeof item.html === 'string' ? item.html : '';
      }
      if (mode === 'hikka') {
        setWatchStreamProvider('hikka');
        try {
          localStorage.setItem('server_type', 'sub');
          localStorage.removeItem('server_name');
        } catch {
          /* ignore */
        }
        return typeof item.html === 'string' ? item.html : '';
      }
      if (mode === 'anikoto-sub') {
        setWatchStreamProvider('anikoto');
        setActiveServerId('1');
        try {
          localStorage.setItem('server_type', 'sub');
          localStorage.removeItem('server_name');
        } catch {
          /* ignore */
        }
        return typeof item.html === 'string' ? item.html : '';
      }
      if (mode === 'anikoto-dub') {
        setWatchStreamProvider('anikoto');
        setActiveServerId('2');
        try {
          localStorage.setItem('server_type', 'dub');
          localStorage.removeItem('server_name');
        } catch {
          /* ignore */
        }
        return typeof item.html === 'string' ? item.html : '';
      }
      const dataId = item.data_id != null ? String(item.data_id) : null;
      if (dataId) setActiveServerId(dataId);
      if (typeof item.serverName === 'string')
        localStorage.setItem('server_name', item.serverName);
      if (typeof item.type === 'string')
        localStorage.setItem('server_type', item.type);
      return typeof item.html === 'string' ? item.html : '';
    },
  });
}
