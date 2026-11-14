import { describe, expect, it } from 'vitest';

import { buildFlatLanguageMenu } from './buildFlatLanguageMenu';

describe('buildFlatLanguageMenu', () => {
  it('shows Ukrainian, Japanese, and English when each source is eligible', () => {
    const menu = buildFlatLanguageMenu({
      playbackAudio: 'uk',
      hikkaLanguageMenuEligible: true,
      anikotoJapaneseEligible: true,
      anikotoEnglishEligible: true,
    });

    expect(menu.map((item) => item.html)).toEqual(['Ukrainian', 'Japanese', 'English']);
    expect(menu.find((item) => item.html === 'Ukrainian')?.default).toBe(true);
    expect(menu.find((item) => item.html === 'Japanese')?.__mode).toBe('anikoto-ja');
    expect(menu.find((item) => item.html === 'English')?.__mode).toBe('anikoto-en');
  });

  it('hides an audio track the title does not have', () => {
    const menu = buildFlatLanguageMenu({
      playbackAudio: 'ja',
      hikkaLanguageMenuEligible: true,
      anikotoJapaneseEligible: true,
      anikotoEnglishEligible: false,
    });

    expect(menu.map((item) => item.html)).toEqual(['Ukrainian', 'Japanese']);
    expect(menu.find((item) => item.html === 'Japanese')?.default).toBe(true);
  });

  it('is empty when no audio source is eligible', () => {
    expect(
      buildFlatLanguageMenu({
        playbackAudio: 'uk',
        hikkaLanguageMenuEligible: false,
        anikotoJapaneseEligible: false,
        anikotoEnglishEligible: false,
      }),
    ).toEqual([]);
  });
});
