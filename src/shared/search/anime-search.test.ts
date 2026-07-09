import { describe, expect, it } from 'vitest';
import { normalizeAnimeSearchQuery } from './anime-search-rank';

describe('normalizeAnimeSearchQuery', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeAnimeSearchQuery('  foo   bar  ')).toBe('foo bar');
  });

  it('normalizes unicode to NFKC', () => {
    expect(normalizeAnimeSearchQuery('ＡＢＣ')).toBe('ABC');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeAnimeSearchQuery('   ')).toBe('');
  });
});

describe('search page keyword query encoding', () => {
  it('encodes reserved characters in keyword param', () => {
    const params = new URLSearchParams();
    params.set('keyword', 'a&b?c=d');
    expect(params.toString()).toBe('keyword=a%26b%3Fc%3Dd');
  });
});
