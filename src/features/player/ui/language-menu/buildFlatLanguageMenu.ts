import { SERVER_PRIORITY_ORDER, mirrorServerLabel } from '@/shared/data/servers';
import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { ServerInfo } from '@/shared/types/GlobalAnimeTypes';

export type LangMenuLeaf = {
  html: string;
  default?: boolean;
  data_id?: number;
  serverName?: string;
  type?: string;
  __mode?: 'animepahe-sub' | 'animepahe-dub' | 'aniliberty' | 'hikka';
};

function pickPreferredInGroup(list: ServerInfo[]): ServerInfo | undefined {
  if (!list.length) return undefined;
  for (const pref of SERVER_PRIORITY_ORDER) {
    const p = pref.toLowerCase();
    const hit = list.find((s) => mirrorServerLabel(s.serverName).toLowerCase() === p);
    if (hit) return hit;
  }
  return list[0];
}

export function buildFlatLanguageMenu(input: {
  langServers: ServerInfo[] | null;
  langActiveId: string | null;
  watchStreamProvider: WatchStreamProvider;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
}): LangMenuLeaf[] {
  const {
    langServers,
    langActiveId,
    watchStreamProvider,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
  } = input;

  const subList = langServers?.filter((s) => s.type === 'sub') ?? [];
  const dubList = langServers?.filter((s) => s.type === 'dub') ?? [];
  const jp =
    subList.find((s) => String(s.data_id) === String(langActiveId)) ??
    pickPreferredInGroup(subList);
  const en =
    dubList.find((s) => String(s.data_id) === String(langActiveId)) ??
    pickPreferredInGroup(dubList);

  const flatLanguage: LangMenuLeaf[] = [];

  if (jp) {
    flatLanguage.push({
      html: jp.serverName?.trim() || 'Japanese',
      default:
        watchStreamProvider === 'animepahe' &&
        String(jp.data_id) === String(langActiveId),
      data_id: jp.data_id,
      serverName: jp.serverName,
      type: jp.type,
      __mode: 'animepahe-sub',
    });
  }

  if (en) {
    flatLanguage.push({
      html: en.serverName?.trim() || 'English',
      default:
        watchStreamProvider === 'animepahe' &&
        String(en.data_id) === String(langActiveId),
      data_id: en.data_id,
      serverName: en.serverName,
      type: en.type,
      __mode: 'animepahe-dub',
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

  return flatLanguage;
}

export function languageMenuTooltip(input: {
  watchStreamProvider: WatchStreamProvider;
  hikkaLanguageMenuEligible: boolean;
  anilibertyLanguageMenuEligible: boolean;
  langServers: ServerInfo[] | null;
  langActiveId: string | null;
}): string {
  const {
    watchStreamProvider,
    hikkaLanguageMenuEligible,
    anilibertyLanguageMenuEligible,
    langServers,
    langActiveId,
  } = input;

  if (watchStreamProvider === 'hikka' && hikkaLanguageMenuEligible) return 'Ukrainian';
  if (watchStreamProvider === 'aniliberty' && anilibertyLanguageMenuEligible) {
    return 'Anilibria';
  }
  return langServers?.find((s) => String(s.data_id) === String(langActiveId))?.type === 'dub'
    ? 'English'
    : 'Japanese';
}
