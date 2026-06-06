import type { WatchStreamProvider } from '@/lib/watch-provider';

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
  anikotoActiveLang?: 'sub' | 'dub' | null;
}): LangMenuLeaf[] {
  const {
    watchStreamProvider,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    anikotoActiveLang,
  } = input;

  const flatLanguage: LangMenuLeaf[] = [];

  if (anikotoLanguageMenuEligible) {
    flatLanguage.push({
      html: 'Japanese',
      default: watchStreamProvider === 'anikoto' && anikotoActiveLang !== 'dub',
      __mode: 'anikoto-sub',
    });
    flatLanguage.push({
      html: 'English',
      default: watchStreamProvider === 'anikoto' && anikotoActiveLang === 'dub',
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
  anikotoActiveLang?: 'sub' | 'dub' | null;
}): string {
  const {
    watchStreamProvider,
    hikkaLanguageMenuEligible,
    anilibertyLanguageMenuEligible,
    anikotoLanguageMenuEligible,
    anikotoActiveLang,
  } = input;

  if (watchStreamProvider === 'hikka' && hikkaLanguageMenuEligible) return 'Ukrainian';
  if (watchStreamProvider === 'aniliberty' && anilibertyLanguageMenuEligible) {
    return 'Anilibria';
  }
  if (watchStreamProvider === 'anikoto' && anikotoLanguageMenuEligible) {
    return anikotoActiveLang === 'dub' ? 'English' : 'Japanese';
  }
  if (anikotoLanguageMenuEligible) return 'Japanese';
  if (hikkaLanguageMenuEligible) return 'Ukrainian';
  if (anilibertyLanguageMenuEligible) return 'Anilibria';
  return 'Language';
}
