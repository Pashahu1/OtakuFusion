import type Artplayer from 'artplayer';

import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';
import {
  isWatchDubServerId,
  WATCH_SERVER_DUB_ID,
  WATCH_SERVER_SUB_ID,
} from '@/shared/data/servers';

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
  resolvedStreamLang?: 'sub' | 'dub' | null;
  onBeforeLanguageSwitch?: (art: Artplayer) => LanguageSwitchResumeContext | null;
}

function applyLanguageSettingTooltip(art: Artplayer, tooltip: string): void {
  try {
    const setting = art.setting as Artplayer['setting'] & {
      get?: (name: string) => { tooltip?: string; $tooltip?: HTMLElement } | undefined;
    };
    const item = setting.get?.('language');
    if (!item) return;
    item.tooltip = tooltip;
    if (item.$tooltip) item.$tooltip.textContent = tooltip;
  } catch {
    /* setting may not exist yet */
  }
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
    resolvedStreamLang,
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

  const anikotoActiveLang: 'sub' | 'dub' | null =
    watchStreamProvider === 'anikoto'
      ? isWatchDubServerId(activeServerIdRef.current)
        ? 'dub'
        : 'sub'
      : null;

  const menuInput = {
    watchStreamProvider,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    activeServerId: activeServerIdRef.current,
    anikotoActiveLang,
    resolvedStreamLang,
  };

  const flatLanguage = buildFlatLanguageMenu(menuInput);

  if (flatLanguage.length === 0) return;

  const langTooltip = languageMenuTooltip(menuInput);

  art.setting.add({
    name: 'language',
    icon: serverIcon,
    html: 'Language',
    tooltip: langTooltip,
    position: 'right',
    selector: flatLanguage,
    onSelect: function (item: Record<string, unknown>) {
      onBeforeLanguageSwitch?.(art);
      const container = art.template?.$player ?? null;
      hardStopWatchPlayerSurface(
        art,
        container instanceof HTMLDivElement ? container : null,
      );

      if (item.__mode === 'aniliberty') {
        setWatchStreamProvider('aniliberty');
        try {
          localStorage.setItem('server_type', 'sub');
          localStorage.removeItem('server_name');
        } catch {
          /* ignore */
        }
        return;
      }
      if (item.__mode === 'hikka') {
        setWatchStreamProvider('hikka');
        try {
          localStorage.setItem('server_type', 'sub');
          localStorage.removeItem('server_name');
        } catch {
          /* ignore */
        }
        return;
      }
      if (item.__mode === 'anikoto-sub') {
        setWatchStreamProvider('anikoto');
        setActiveServerId(WATCH_SERVER_SUB_ID);
        try {
          localStorage.setItem('server_type', 'sub');
          localStorage.removeItem('server_name');
        } catch {
          /* ignore */
        }
        return;
      }
      if (item.__mode === 'anikoto-dub') {
        setWatchStreamProvider('anikoto');
        setActiveServerId(WATCH_SERVER_DUB_ID);
        try {
          localStorage.setItem('server_type', 'dub');
          localStorage.removeItem('server_name');
        } catch {
          /* ignore */
        }
        return;
      }
      const dataId = item.data_id != null ? String(item.data_id) : null;
      if (dataId) setActiveServerId(dataId);
      if (typeof item.serverName === 'string')
        localStorage.setItem('server_name', item.serverName);
      if (typeof item.type === 'string')
        localStorage.setItem('server_type', item.type);
    },
  });

  applyLanguageSettingTooltip(art, langTooltip);
}
