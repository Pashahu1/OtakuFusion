import { describe, expect, it } from 'vitest';
import type { AnimeSearchRankMedia } from './anime-search-rank';
import {
  filterAnimeSearchResults,
  getAnimeDisplayTitle,
  isCjkSearchQuery,
  rankAnimeSearchMedia,
  scoreAnimeSearchMedia,
} from './anime-search-rank';

function media(
  partial: Partial<AnimeSearchRankMedia> & Pick<AnimeSearchRankMedia, 'id'>,
): AnimeSearchRankMedia {
  return {
    title: { english: 'Example', romaji: 'Example', native: '例' },
    ...partial,
  };
}

describe('getAnimeDisplayTitle', () => {
  it('prefers english title', () => {
    expect(
      getAnimeDisplayTitle(
        media({
          id: 1,
          title: { english: 'Naruto', romaji: 'Naruto', native: 'ナルト' },
        }),
      ),
    ).toBe('Naruto');
  });

  it('falls back to romaji when english is missing', () => {
    expect(
      getAnimeDisplayTitle(
        media({
          id: 1,
          title: { english: null, romaji: 'Shingeki no Kyojin', native: '進撃の巨人' },
        }),
      ),
    ).toBe('Shingeki no Kyojin');
  });
});

describe('isCjkSearchQuery', () => {
  it('detects CJK scripts', () => {
    expect(isCjkSearchQuery('進撃')).toBe(true);
    expect(isCjkSearchQuery('naruto')).toBe(false);
  });
});

describe('scoreAnimeSearchMedia', () => {
  it('scores exact english title higher than partial match', () => {
    const exact = media({ id: 1, title: { english: 'Naruto' } });
    const partial = media({ id: 2, title: { english: 'Boruto: Naruto Next Generations' } });
    expect(scoreAnimeSearchMedia(exact, 'naruto')).toBeGreaterThan(
      scoreAnimeSearchMedia(partial, 'naruto'),
    );
  });
});

describe('rankAnimeSearchMedia', () => {
  it('ranks exact match before unrelated titles', () => {
    const pool = [
      media({ id: 2, title: { english: 'One Piece' } }),
      media({ id: 1, title: { english: 'Naruto' } }),
    ];
    const ranked = rankAnimeSearchMedia(pool, 'naruto');
    expect(ranked[0]?.id).toBe(1);
  });

  it('deduplicates by id', () => {
    const pool = [
      media({ id: 1, title: { english: 'Naruto' } }),
      media({ id: 1, title: { english: 'Naruto Shippuden' } }),
    ];
    expect(rankAnimeSearchMedia(pool, 'naruto')).toHaveLength(1);
  });
});

describe('filterAnimeSearchResults', () => {
  it('keeps all results for very short prefix queries', () => {
    const pool = [
      media({ id: 1, title: { english: 'Naruto' } }),
      media({ id: 2, title: { english: 'One Piece' } }),
    ];
    expect(filterAnimeSearchResults(pool, 'na')).toHaveLength(2);
  });

  it('filters weak matches for latin queries above prefix length', () => {
    const pool = [
      media({ id: 1, title: { english: 'Naruto' } }),
      media({ id: 2, title: { english: 'Completely Unrelated Show Title' } }),
    ];
    const filtered = filterAnimeSearchResults(pool, 'naruto');
    expect(filtered.some((item) => item.id === 1)).toBe(true);
    expect(filtered.some((item) => item.id === 2)).toBe(false);
  });
});
