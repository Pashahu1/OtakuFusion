import type Artplayer from 'artplayer';

import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

import {
  buildFlatLanguageMenu,
  languageMenuTooltip,
} from './language-menu/buildFlatLanguageMenu';
import { serverIcon } from './PlayerIcons';

export interface SyncPlayerLanguageMenuParams {
  serversRef: React.RefObject<ServerInfo[] | null>;
  activeServerIdRef: React.RefObject<string | null>;
  watchStreamProvider: WatchStreamProvider;
  setWatchStreamProvider: (next: WatchStreamProvider) => void;
  setActiveServerId: (id: string | null) => void;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
}

export function syncPlayerLanguageMenu(
  art: Artplayer,
  params: SyncPlayerLanguageMenuParams,
): void {
  const {
    serversRef,
    activeServerIdRef,
    watchStreamProvider,
    setWatchStreamProvider,
    setActiveServerId,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
  } = params;

  try {
    art.setting.remove('language');
  } catch {
    /* setting may not exist yet */
  }

  const langServers = serversRef.current ?? null;
  const langActiveId = activeServerIdRef.current ?? null;

  const flatLanguage = buildFlatLanguageMenu({
    langServers,
    langActiveId,
    watchStreamProvider,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
  });

  if (flatLanguage.length === 0) return;

  const langTooltip = languageMenuTooltip({
    watchStreamProvider,
    hikkaLanguageMenuEligible,
    anilibertyLanguageMenuEligible,
    langServers,
    langActiveId,
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
      if (mode === 'animepahe-sub' || mode === 'animepahe-dub') {
        setWatchStreamProvider('animepahe');
        const dataId = item.data_id != null ? String(item.data_id) : null;
        if (dataId) setActiveServerId(dataId);
        if (typeof item.serverName === 'string')
          localStorage.setItem('server_name', item.serverName);
        if (typeof item.type === 'string')
          localStorage.setItem('server_type', item.type);
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
