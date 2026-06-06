import type { WatchStreamProvider } from '@/lib/watch-provider';

export type LangMenuLeaf = {
  html: string;
  default?: boolean;
  __mode?: 'aniliberty' | 'hikka';
};

export function buildFlatLanguageMenu(input: {
  watchStreamProvider: WatchStreamProvider;
  anilibertyLanguageMenuEligible: boolean;
  hikkaLanguageMenuEligible: boolean;
}): LangMenuLeaf[] {
  const {
    watchStreamProvider,
    anilibertyLanguageMenuEligible,
    hikkaLanguageMenuEligible,
  } = input;

  const flatLanguage: LangMenuLeaf[] = [];

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
}): string {
  const {
    watchStreamProvider,
    hikkaLanguageMenuEligible,
    anilibertyLanguageMenuEligible,
  } = input;

  if (watchStreamProvider === 'hikka' && hikkaLanguageMenuEligible) return 'Ukrainian';
  if (watchStreamProvider === 'aniliberty' && anilibertyLanguageMenuEligible) {
    return 'Anilibria';
  }
  if (hikkaLanguageMenuEligible) return 'Ukrainian';
  if (anilibertyLanguageMenuEligible) return 'Anilibria';
  return 'Language';
}
