import type { WatchPlaybackAudio } from '@/features/watch/lib/playback-audio';

export type LangMenuMode = 'hikka' | 'anikoto-ja' | 'anikoto-en';

export type LangMenuLeaf = {
  html: string;
  default?: boolean;
  __mode?: LangMenuMode;
};

export function playbackAudioFromMenuMode(
  mode: LangMenuMode | undefined,
): WatchPlaybackAudio | null {
  if (mode === 'hikka') return 'uk';
  if (mode === 'anikoto-ja') return 'ja';
  if (mode === 'anikoto-en') return 'en';
  return null;
}

export function buildFlatLanguageMenu(input: {
  playbackAudio: WatchPlaybackAudio;
  hikkaLanguageMenuEligible: boolean;
  anikotoJapaneseEligible: boolean;
  anikotoEnglishEligible: boolean;
}): LangMenuLeaf[] {
  const items: LangMenuLeaf[] = [];
  if (input.hikkaLanguageMenuEligible) {
    items.push({
      html: 'Ukrainian',
      default: input.playbackAudio === 'uk',
      __mode: 'hikka',
    });
  }
  if (input.anikotoJapaneseEligible) {
    items.push({
      html: 'Japanese',
      default: input.playbackAudio === 'ja',
      __mode: 'anikoto-ja',
    });
  }
  if (input.anikotoEnglishEligible) {
    items.push({
      html: 'English',
      default: input.playbackAudio === 'en',
      __mode: 'anikoto-en',
    });
  }
  if (items.length > 0 && !items.some((item) => item.default)) {
    items[0] = { ...items[0], default: true };
  }
  return items;
}

export function languageMenuTooltip(audio: WatchPlaybackAudio): string {
  if (audio === 'ja') return 'Japanese';
  if (audio === 'en') return 'English';
  return 'Ukrainian';
}
