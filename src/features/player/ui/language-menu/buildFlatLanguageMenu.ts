import type { WatchStreamProvider } from '@/lib/watch-provider';
import { ANIKOTO_PLAYBACK_ENABLED } from '@/features/watch/lib/watch-provider';

import { resolveLanguageMenuAnikotoLang } from './resolveLanguageMenuAnikotoLang';

export type LangMenuLeaf = {
  html: string;
  default?: boolean;
  __mode?: 'hikka' | 'anikoto-sub' | 'anikoto-dub';
};

export function buildFlatLanguageMenu(input: {
  watchStreamProvider: WatchStreamProvider;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  activeServerId?: string | null;
  anikotoActiveLang?: 'sub' | 'dub' | null;
  resolvedStreamLang?: 'sub' | 'dub' | null;
}): LangMenuLeaf[] {
  const {
    watchStreamProvider,
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

  const anikotoMenuOpen =
    ANIKOTO_PLAYBACK_ENABLED && anikotoLanguageMenuEligible;

  if (anikotoMenuOpen) {
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

  return flatLanguage;
}

export function languageMenuTooltip(input: {
  watchStreamProvider: WatchStreamProvider;
  hikkaLanguageMenuEligible: boolean;
  anikotoLanguageMenuEligible: boolean;
  activeServerId?: string | null;
  anikotoActiveLang?: 'sub' | 'dub' | null;
  resolvedStreamLang?: 'sub' | 'dub' | null;
}): string {
  const {
    watchStreamProvider,
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

  const anikotoMenuOpen =
    ANIKOTO_PLAYBACK_ENABLED && anikotoLanguageMenuEligible;

  if (watchStreamProvider === 'hikka' && hikkaLanguageMenuEligible) return 'Ukrainian';
  if (watchStreamProvider === 'anikoto' && anikotoMenuOpen) {
    return effectiveAnikotoLang === 'dub' ? 'English' : 'Japanese';
  }
  if (anikotoMenuOpen) return 'Japanese';
  if (hikkaLanguageMenuEligible) return 'Ukrainian';
  return 'Language';
}
