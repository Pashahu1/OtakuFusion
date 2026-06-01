import { describe, expect, it } from 'vitest';
import {
  filterAniListMediaArray,
  isBlockedAnimeMedia,
  isBlockedGenreBrowseName,
} from './anime-content-policy';

describe('anime-content-policy', () => {
  it('does not block isAdult without Hentai genre', () => {
    expect(isBlockedAnimeMedia({ isAdult: true, genres: ['Action', 'Ecchi'] })).toBe(
      false
    );
  });

  it('blocks Hentai genre', () => {
    expect(
      isBlockedAnimeMedia({ isAdult: false, genres: ['Action', 'Hentai'] })
    ).toBe(true);
  });

  it('allows safe media', () => {
    expect(
      isBlockedAnimeMedia({ isAdult: false, genres: ['Action', 'Romance'] })
    ).toBe(false);
  });

  it('filters arrays', () => {
    const out = filterAniListMediaArray([
      { isAdult: false, genres: ['Comedy'] },
      { isAdult: false, genres: ['Hentai'] },
    ]);
    expect(out).toHaveLength(1);
  });

  it('blocks hentai browse slug', () => {
    expect(isBlockedGenreBrowseName('hentai')).toBe(true);
    expect(isBlockedGenreBrowseName('Hentai')).toBe(true);
    expect(isBlockedGenreBrowseName('action')).toBe(false);
  });
});
