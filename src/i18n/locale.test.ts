import { describe, expect, it } from 'vitest';

import { parseAppLocale } from './locales';

describe('parseAppLocale', () => {
  it('accepts en, uk and de', () => {
    expect(parseAppLocale('en')).toBe('en');
    expect(parseAppLocale('uk')).toBe('uk');
    expect(parseAppLocale('de')).toBe('de');
  });

  it('falls back to en', () => {
    expect(parseAppLocale(null)).toBe('en');
    expect(parseAppLocale('fr')).toBe('en');
  });
});
