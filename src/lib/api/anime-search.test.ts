import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AniListMedia } from '@/lib/anilist/types';

const { getAniListSearchPageMock } = vi.hoisted(() => ({
  getAniListSearchPageMock: vi.fn(),
}));

vi.mock('@/lib/anilist', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/anilist')>();
  return {
    ...actual,
    getAniListSearchPage: getAniListSearchPageMock,
  };
});

import { getAnimeSearch } from './anime-search';

const narutoMedia: AniListMedia = {
  id: 20,
  title: { english: 'Naruto', romaji: 'Naruto', native: 'ナルト' },
  coverImage: { extraLarge: 'https://example.com/naruto.jpg' },
  format: 'TV',
  episodes: 220,
  averageScore: 80,
  popularity: 500_000,
  favourites: 100_000,
  genres: ['Action'],
  isAdult: false,
};

describe('getAnimeSearch', () => {
  beforeEach(() => {
    getAniListSearchPageMock.mockReset();
  });

  it('returns [] for queries shorter than min length', async () => {
    await expect(getAnimeSearch('')).resolves.toEqual([]);
    await expect(getAnimeSearch('a')).resolves.toEqual([]);
    expect(getAniListSearchPageMock).not.toHaveBeenCalled();
  });

  it('returns [] when AniList returns no media', async () => {
    getAniListSearchPageMock.mockResolvedValue({ media: [] });
    await expect(getAnimeSearch('naruto')).resolves.toEqual([]);
  });

  it('maps and ranks AniList media into search items', async () => {
    getAniListSearchPageMock.mockResolvedValue({
      media: [
        {
          ...narutoMedia,
          id: 21,
          title: { english: 'Boruto', romaji: 'Boruto' },
        },
        narutoMedia,
      ],
    });

    const results = await getAnimeSearch('naruto');

    expect(results).toHaveLength(2);
    expect(results[0]?.title).toBe('Naruto');
    expect(results[0]?.id).toBe('20');
    expect(results[0]?.poster).toContain('naruto.jpg');
  });
});
