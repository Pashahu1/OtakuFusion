import { describe, expect, it } from 'vitest';

import { buildFlatLanguageMenu, languageMenuTooltip } from './buildFlatLanguageMenu';
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
    anilibertyLanguageMenuEligible: false,
    hikkaLanguageMenuEligible: false,
    anikotoLanguageMenuEligible: true,
  };

  it('marks Japanese active when stream resolved sub after failed dub pick', () => {
    const menu = buildFlatLanguageMenu({
      ...base,
      watchStreamProvider: 'anikoto',
      activeServerId: '2',
      resolvedStreamLang: 'sub',
    });

    expect(menu.find((item) => item.html === 'Japanese')?.default).toBe(true);
    expect(menu.find((item) => item.html === 'English')?.default).toBe(false);
  });

  it('shows Anilibria after provider fallback from hikka', () => {
    const menu = buildFlatLanguageMenu({
      ...base,
      hikkaLanguageMenuEligible: true,
      anilibertyLanguageMenuEligible: true,
      watchStreamProvider: 'aniliberty',
      activeServerId: '1',
    });

    expect(languageMenuTooltip({
      ...base,
      hikkaLanguageMenuEligible: true,
      anilibertyLanguageMenuEligible: true,
      watchStreamProvider: 'aniliberty',
      activeServerId: '1',
    })).toBe('Anilibria');
    expect(menu.find((item) => item.html === 'Anilibria')?.default).toBe(true);
    expect(menu.find((item) => item.html === 'Ukrainian')?.default).toBe(false);
  });
});
