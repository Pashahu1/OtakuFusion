import { describe, expect, it } from 'vitest';

import { buildFlatLanguageMenu } from './buildFlatLanguageMenu';
import { resolveLanguageMenuAnikotoLang } from './resolveLanguageMenuAnikotoLang';

describe('resolveLanguageMenuAnikotoLang', () => {
  it('prefers resolved stream lang over stale dub selection', () => {
    expect(
      resolveLanguageMenuAnikotoLang({
        watchStreamProvider: 'anikoto',
        activeServerId: '2',
        resolvedStreamLang: 'sub',
      }),
    ).toBe('sub');
  });
});

describe('buildFlatLanguageMenu', () => {
  const base = {
    hikkaLanguageMenuEligible: false,
    anikotoLanguageMenuEligible: true,
  };

  it('hides Japanese and English while Anikoto playback is locked', () => {
    const menu = buildFlatLanguageMenu({
      ...base,
      hikkaLanguageMenuEligible: true,
      watchStreamProvider: 'hikka',
      activeServerId: '1',
      resolvedStreamLang: 'sub',
    });

    expect(menu.find((item) => item.html === 'Japanese')).toBeUndefined();
    expect(menu.find((item) => item.html === 'English')).toBeUndefined();
    expect(menu.find((item) => item.html === 'Ukrainian')?.default).toBe(true);
  });
});
