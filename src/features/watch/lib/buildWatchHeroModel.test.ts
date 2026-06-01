import { describe, expect, it } from 'vitest';

import type { AnimeData } from '@/shared/types/animeDetailsTypes';

import { buildWatchHeroModel } from './buildWatchHeroModel';

const baseAnime: AnimeData = {
  adultContent: false,
  id: '195600',
  data_id: 195600,
  poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx195600.jpg',
  title: 'Test Anime',
  japanese_title: 'テスト',
  mal_id: 1,
  showType: 'TV',
  recommended_data: [],
  related_data: [],
  animeInfo: {
    Overview: 'Overview text',
    Japanese: '',
    Synonyms: '',
    Aired: '',
    Premiered: '',
    Duration: '',
    Status: '',
    Genres: ['Action'],
    Studios: [],
    Producers: [],
    'MAL Score': '8.2',
    tvInfo: {
      showType: 'TV',
      duration: '24m',
      releaseDate: '2024',
      quality: 'HD',
    },
  },
};

describe('buildWatchHeroModel', () => {
  it('maps catalog metadata and TVDB artwork', () => {
    const hero = buildWatchHeroModel(baseAnime, {
      clearLogoUrl: 'https://artworks.thetvdb.com/logo.png',
      heroImageUrl: 'https://artworks.thetvdb.com/bg.jpg',
      seasonLabel: 'Season 2',
    });

    expect(hero).toMatchObject({
      id: '195600',
      title: 'Test Anime',
      scorePercent: 82,
      clearLogoUrl: 'https://artworks.thetvdb.com/logo.png',
      heroImageUrl: 'https://artworks.thetvdb.com/bg.jpg',
      seasonLabel: 'Season 2',
      genres: ['Action'],
    });
  });

  it('normalizes MAL score already in percent form', () => {
    const hero = buildWatchHeroModel(
      {
        ...baseAnime,
        animeInfo: { ...baseAnime.animeInfo!, 'MAL Score': '78' },
      },
      undefined,
    );

    expect(hero.scorePercent).toBe(78);
  });
});
