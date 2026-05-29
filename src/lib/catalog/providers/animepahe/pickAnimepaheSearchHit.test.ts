import { describe, expect, it } from 'vitest';
import {
  pickBestAnimepaheSearchHit,
  pickBestAnimepaheSearchHitRelaxed,
} from '@/lib/catalog/providers/animepahe/pickAnimepaheSearchHit';
import type { CrysolineAnimepaheSearchRow } from '@/server/crysoline/animepaheClient';
import type { AnimepaheCatalogHints } from '@/lib/catalog/providers/animepahe/catalogHints';

function animepaheHit(
  overrides: Partial<CrysolineAnimepaheSearchRow> & Pick<CrysolineAnimepaheSearchRow, 'id'>
): CrysolineAnimepaheSearchRow {
  return {
    title: { romaji: 'Placeholder', english: 'Placeholder', native: 'プレースホルダー' },
    totalEpisodes: 12,
    year: 2020,
    metadata: { type: 'TV' },
    ...overrides,
  };
}

describe('pickBestAnimepaheSearchHit', () => {
  const terms = ['jujutsu'];

  it('returns null for empty list', () => {
    expect(pickBestAnimepaheSearchHit([], {}, terms)).toBeNull();
  });

  it('picks hit matching title and hints', () => {
    const hits: CrysolineAnimepaheSearchRow[] = [
      animepaheHit({
        id: 'a1',
        title: {
          romaji: 'Jujutsu Kaisen',
          english: 'Jujutsu Kaisen',
          native: '呪術廻戦',
        },
        year: 2020,
        totalEpisodes: 24,
      }),
    ];
    const hints: AnimepaheCatalogHints = {
      seasonYear: 2020,
      episodeCount: 24,
      format: 'tv',
    };

    const picked = pickBestAnimepaheSearchHit(hits, hints, terms);

    expect(picked?.id).toBe('a1');
  });

  it('returns null on low score (no term match)', () => {
    const hits: CrysolineAnimepaheSearchRow[] = [
      animepaheHit({
        id: 'a1',
        title: { romaji: 'Naruto', english: 'Naruto', native: 'ナルト' },
        year: 2020,
        totalEpisodes: 24,
      }),
    ];

    expect(
      pickBestAnimepaheSearchHit(hits, { seasonYear: 2020, episodeCount: 24 }, terms)
    ).toBeNull();
  });

  it('returns null when ambiguous (two equally strong hits)', () => {
    const title = {
      romaji: 'Jujutsu Kaisen',
      english: 'Jujutsu Kaisen',
      native: '呪術廻戦',
    };
    const hits: CrysolineAnimepaheSearchRow[] = [
      animepaheHit({ id: 'a1', title, year: 2020, totalEpisodes: 24 }),
      animepaheHit({ id: 'a2', title, year: 2020, totalEpisodes: 24 }),
    ];
    const hints: AnimepaheCatalogHints = { seasonYear: 2020, episodeCount: 24 };

    expect(pickBestAnimepaheSearchHit(hits, hints, terms)).toBeNull();
  });
});

describe('pickBestAnimepaheSearchHitRelaxed', () => {
  it('returns best hit at score ≥ 42 without lead requirement', () => {
    const title = {
      romaji: 'Jujutsu Kaisen',
      english: 'Jujutsu Kaisen',
      native: '呪術廻戦',
    };
    const hits: CrysolineAnimepaheSearchRow[] = [
      animepaheHit({ id: 'a1', title, year: 2020, totalEpisodes: 24 }),
      animepaheHit({
        id: 'a2',
        title: { ...title, english: 'Jujutsu Kaisen 0' },
        year: 2020,
        totalEpisodes: 1,
      }),
    ];

    const picked = pickBestAnimepaheSearchHitRelaxed(hits, {}, ['jujutsu']);

    expect(picked?.id).toBe('a1');
  });
});
