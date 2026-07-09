import { describe, expect, it } from 'vitest';
import { buildAnimeSearchQueryVariants } from './build-anime-search-query-variants';

describe('buildAnimeSearchQueryVariants', () => {
  it('returns empty array for blank input', () => {
    expect(buildAnimeSearchQueryVariants('   ')).toEqual([]);
  });

  it('strips season suffix into a shorter variant', () => {
    const variants = buildAnimeSearchQueryVariants('Attack on Titan Season 2');
    expect(variants).toContain('Attack on Titan Season 2');
    expect(variants).toContain('Attack on Titan');
  });

  it('removes parenthetical noise', () => {
    const variants = buildAnimeSearchQueryVariants('Fate/stay night (TV)');
    expect(variants.some((v) => v.includes('(TV)') === false)).toBe(true);
  });

  it('deduplicates identical variants', () => {
    const variants = buildAnimeSearchQueryVariants('Naruto');
    expect(variants.filter((v) => v === 'Naruto')).toHaveLength(1);
  });
});
