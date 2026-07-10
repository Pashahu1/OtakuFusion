import type { WatchStreamProvider } from '@/lib/watch-provider';

import { resolveLanguageMenuAnikotoLang } from './resolveLanguageMenuAnikotoLang';

export type LangMenuLeaf = {
  html: string;
  default?: boolean;
  __mode?: 'aniliberty' | 'hikka' | 'anikoto-sub' | 'anikoto-dub';
};

export function buildFlatLanguageMenu(input: {
  watchStreamProvider: WatchStreamProvider;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  activeServerId?: string | null;
  anikotoActiveLang?: 'sub' | 'dub' | null;
  resolvedStreamLang?: 'sub' | 'dub' | null;
}): LangMenuLeaf[] {
  const {
    watchStreamProvider,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    activeServerId,
    anikotoActiveLang,
    resolvedStreamLang,
  } = input;

  const effectiveAnikotoLang =
    resolveLanguageMenuAnikotoLang({
      watchStreamProvider,
      activeServerId: activeServerId ?? null,
      resolvedStreamLang,
    }) ?? anikotoActiveLang;

  const flatLanguage: LangMenuLeaf[] = [];

  if (anikotoLanguageMenuEligible) {
    flatLanguage.push({
      html: 'Japanese',
      default: watchStreamProvider === 'anikoto' && effectiveAnikotoLang !== 'dub',
      __mode: 'anikoto-sub',
    });
    flatLanguage.push({
      html: 'English',
      default: watchStreamProvider === 'anikoto' && effectiveAnikotoLang === 'dub',
      __mode: 'anikoto-dub',
    });
  }

  if (hikkaLanguageMenuEligible) {
    flatLanguage.push({
      html: 'Ukrainian',
      default: watchStreamProvider === 'hikka',
      __mode: 'hikka',
    });
  }

  if (anilibertyLanguageMenuEligible) {
    flatLanguage.push({
      html: 'Anilibria',
      default: watchStreamProvider === 'aniliberty',
      __mode: 'aniliberty',
    });
  }

  return flatLanguage;
}

export function languageMenuTooltip(input: {
  watchStreamProvider: WatchStreamProvider;
  hikkaLanguageMenuEligible: boolean;
  anilibertyLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  activeServerId?: string | null;
  anikotoActiveLang?: 'sub' | 'dub' | null;
  resolvedStreamLang?: 'sub' | 'dub' | null;
}): string {
  const {
    watchStreamProvider,
    hikkaLanguageMenuEligible,
    anilibertyLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    activeServerId,
    anikotoActiveLang,
    resolvedStreamLang,
  } = input;

  const effectiveAnikotoLang =
    resolveLanguageMenuAnikotoLang({
      watchStreamProvider,
      activeServerId: activeServerId ?? null,
      resolvedStreamLang,
    }) ?? anikotoActiveLang;

  if (watchStreamProvider === 'hikka' && hikkaLanguageMenuEligible) return 'Ukrainian';
  if (watchStreamProvider === 'aniliberty' && anilibertyLanguageMenuEligible) {
    return 'Anilibria';
  }
  if (watchStreamProvider === 'anikoto' && anikotoLanguageMenuEligible) {
    return effectiveAnikotoLang === 'dub' ? 'English' : 'Japanese';
  }
  if (anikotoLanguageMenuEligible) return 'Japanese';
  if (hikkaLanguageMenuEligible) return 'Ukrainian';
  if (anilibertyLanguageMenuEligible) return 'Anilibria';
  return 'Language';
}
