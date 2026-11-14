import { describe, expect, it } from 'vitest';

import { buildFlatLanguageMenu } from './buildFlatLanguageMenu';

describe('buildFlatLanguageMenu', () => {
  it('shows only Ukrainian when Hikka catalog is eligible', () => {
    const menu = buildFlatLanguageMenu({
      hikkaLanguageMenuEligible: true,
      watchStreamProvider: 'hikka',
    });

    expect(menu.map((item) => item.html)).toEqual(['Ukrainian']);
    expect(menu.find((item) => item.html === 'Ukrainian')?.default).toBe(true);
    expect(menu.find((item) => item.html === 'Japanese')).toBeUndefined();
    expect(menu.find((item) => item.html === 'English')).toBeUndefined();
  });

  it('is empty when Hikka catalog is missing', () => {
    expect(
      buildFlatLanguageMenu({
        hikkaLanguageMenuEligible: false,
        watchStreamProvider: 'hikka',
      }),
    ).toEqual([]);
  });
});
