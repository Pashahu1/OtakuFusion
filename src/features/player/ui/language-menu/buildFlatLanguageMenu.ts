import type { WatchStreamProvider } from '@/lib/watch-provider';

export type LangMenuLeaf = {
  html: string;
  default?: boolean;
  __mode?: 'hikka';
};

export function buildFlatLanguageMenu(input: {
  watchStreamProvider: WatchStreamProvider;
  hikkaLanguageMenuEligible: boolean;
}): LangMenuLeaf[] {
  const { watchStreamProvider, hikkaLanguageMenuEligible } = input;
  if (!hikkaLanguageMenuEligible) return [];
  return [
    {
      html: 'Ukrainian',
      default: watchStreamProvider === 'hikka',
      __mode: 'hikka',
    },
  ];
}

export function languageMenuTooltip(input: {
  watchStreamProvider: WatchStreamProvider;
  hikkaLanguageMenuEligible: boolean;
}): string {
  if (input.hikkaLanguageMenuEligible) return 'Ukrainian';
  return 'Language';
}
