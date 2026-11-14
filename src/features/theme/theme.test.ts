import { describe, expect, it } from 'vitest';

import { parseAppTheme } from './theme';

describe('parseAppTheme', () => {
  it('accepts known themes', () => {
    expect(parseAppTheme('dark')).toBe('dark');
    expect(parseAppTheme('midnight')).toBe('midnight');
    expect(parseAppTheme('ember')).toBe('ember');
    expect(parseAppTheme('neon')).toBe('neon');
    expect(parseAppTheme('azure')).toBe('azure');
    expect(parseAppTheme('newyear')).toBe('newyear');
  });

  it('falls back to dark', () => {
    expect(parseAppTheme(null)).toBe('dark');
    expect(parseAppTheme('system')).toBe('dark');
    expect(parseAppTheme('light')).toBe('dark');
  });
});
