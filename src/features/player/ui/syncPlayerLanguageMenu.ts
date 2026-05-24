import type Artplayer from 'artplayer';
import { SERVER_PRIORITY_ORDER, mirrorServerLabel } from '@/shared/data/servers';
import { serverIcon } from './PlayerIcons';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

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
  params: SyncPlayerLanguageMenuParams
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

  }

  const langServers = serversRef.current ?? null;
  const langActiveId = activeServerIdRef.current ?? null;

  function pickPreferredInGroup(list: ServerInfo[]): ServerInfo | undefined {
    if (!list.length) return undefined;
    for (const pref of SERVER_PRIORITY_ORDER) {
      const p = pref.toLowerCase();
      const hit = list.find(
        (s) => mirrorServerLabel(s.serverName).toLowerCase() === p
      );
      if (hit) return hit;
    }
    return list[0];
  }

  const subList = langServers?.filter((s) => s.type === 'sub') ?? [];
  const dubList = langServers?.filter((s) => s.type === 'dub') ?? [];
  const jp =
    subList.find((s) => String(s.data_id) === String(langActiveId)) ??
    pickPreferredInGroup(subList);
  const en =
    dubList.find((s) => String(s.data_id) === String(langActiveId)) ??
    pickPreferredInGroup(dubList);

  type LangMenuLeaf = {
    html: string;
    default?: boolean;
    data_id?: number;
    serverName?: string;
    type?: string;
    __mode?: 'anicore-sub' | 'anicore-dub' | 'aniliberty' | 'hikka';
  };

  const flatLanguage: LangMenuLeaf[] = [];

  if (jp) {
    flatLanguage.push({
      html: jp.serverName?.trim() || 'Japanese',
      default:
        watchStreamProvider === 'anicore' &&
        String(jp.data_id) === String(langActiveId),
      data_id: jp.data_id,
      serverName: jp.serverName,
      type: jp.type,
      __mode: 'anicore-sub',
    });
  }

  if (en) {
    flatLanguage.push({
      html: en.serverName?.trim() || 'English',
      default:
        watchStreamProvider === 'anicore' &&
        String(en.data_id) === String(langActiveId),
      data_id: en.data_id,
      serverName: en.serverName,
      type: en.type,
      __mode: 'anicore-dub',
    });
  }

  if (anilibertyLanguageMenuEligible) {
    flatLanguage.push({
      html: 'Anilibria',
      default: watchStreamProvider === 'aniliberty',
      __mode: 'aniliberty',
    });
  }

  if (hikkaLanguageMenuEligible) {
    flatLanguage.push({
      html: 'Ukrainian',
      default: watchStreamProvider === 'hikka',
      __mode: 'hikka',
    });
  }

  if (flatLanguage.length === 0) return;

  const langTooltip =
    watchStreamProvider === 'hikka' && hikkaLanguageMenuEligible
      ? 'Ukrainian'
      : watchStreamProvider === 'aniliberty' && anilibertyLanguageMenuEligible
        ? 'Anilibria'
        : langServers?.find((s) => String(s.data_id) === String(langActiveId))?.type ===
            'dub'
          ? 'English'
          : 'Japanese';

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

        }
        return typeof item.html === 'string' ? item.html : '';
      }
      if (mode === 'hikka') {
        setWatchStreamProvider('hikka');
        try {
          localStorage.setItem('server_type', 'sub');
          localStorage.removeItem('server_name');
        } catch {

        }
        return typeof item.html === 'string' ? item.html : '';
      }
      if (mode === 'anicore-sub') {
        setWatchStreamProvider('anicore');
        const dataId = item.data_id != null ? String(item.data_id) : null;
        if (dataId) setActiveServerId(dataId);
        if (typeof item.serverName === 'string')
          localStorage.setItem('server_name', item.serverName);
        if (typeof item.type === 'string')
          localStorage.setItem('server_type', item.type);
        return typeof item.html === 'string' ? item.html : '';
      }
      if (mode === 'anicore-dub') {
        setWatchStreamProvider('anicore');
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
