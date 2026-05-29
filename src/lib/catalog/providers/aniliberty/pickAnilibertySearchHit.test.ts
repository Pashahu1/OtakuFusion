import { describe, expect, it } from 'vitest';
import { pickBestAnilibertySearchHit } from '@/lib/catalog/providers/aniliberty/pickAnilibertySearchHit';
import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';
import type { CatalogHints } from '@/lib/catalog/catalog-hints';

function anilibertyHit(
  overrides: Partial<CrysolineAnilibertySearchRow> & Pick<CrysolineAnilibertySearchRow, 'id'>
): CrysolineAnilibertySearchRow {
  return {
    title: { english: 'Placeholder', other: null },
    totalEpisodes: 12,
    year: 2020,
    metadata: { type: 'tv', alias: null, isOngoing: false },
    ...overrides,
  };
}

describe('pickBestAnilibertySearchHit', () => {
  const terms = ['frieren'];

  it('returns null for empty list', () => {
    expect(pickBestAnilibertySearchHit([], {}, terms)).toBeNull();
  });

  it('picks a single confident hit by title and year', () => {
    const hits: CrysolineAnilibertySearchRow[] = [
      anilibertyHit({
        id: 1,
        title: { english: 'Frieren: Beyond Journey\'s End', other: null },
        year: 2023,
        totalEpisodes: 28,
        metadata: { type: 'tv', isOngoing: false },
      }),
    ];
    const hints: CatalogHints = { seasonYear: 2023, episodeCount: 28, format: 'tv' };

    const picked = pickBestAnilibertySearchHit(hits, hints, terms);

    expect(picked?.id).toBe(1);
  });

  it('returns null when ambiguous (small score gap)', () => {
    const base = {
      title: { english: 'Frieren: Beyond Journey\'s End', other: null },
      year: 2023,
      totalEpisodes: 28,
      metadata: { type: 'tv', isOngoing: false },
    };
    const hits: CrysolineAnilibertySearchRow[] = [
      anilibertyHit({ id: 1, ...base }),
      anilibertyHit({
        id: 2,
        title: { english: 'Frieren: Beyond Journey\'s End (Special)', other: null },
        ...base,
      }),
    ];
    const hints: CatalogHints = { seasonYear: 2023, episodeCount: 28 };

    expect(pickBestAnilibertySearchHit(hits, hints, terms)).toBeNull();
  });

  it('returns null when no hit is eligible by episode count', () => {
    const hits: CrysolineAnilibertySearchRow[] = [
      anilibertyHit({
        id: 1,
        title: { english: 'Frieren: Beyond Journey\'s End', other: null },
        totalEpisodes: 99,
        year: 2023,
      }),
    ];

    expect(
      pickBestAnilibertySearchHit(hits, { episodeCount: 28 }, terms)
    ).toBeNull();
  });

  it('returns null when terms do not match title', () => {
    const hits: CrysolineAnilibertySearchRow[] = [
      anilibertyHit({
        id: 1,
        title: { english: 'Sousou no Frieren', other: null },
        year: 2023,
        totalEpisodes: 28,
      }),
    ];

    expect(
      pickBestAnilibertySearchHit(hits, { seasonYear: 2023, episodeCount: 28 }, ['naruto'])
    ).toBeNull();
  });

  it('prefers hit with exact year and episode count', () => {
    const hits: CrysolineAnilibertySearchRow[] = [
      anilibertyHit({
        id: 10,
        title: { english: 'Frieren: Beyond Journey\'s End', other: null },
        year: 2020,
        totalEpisodes: 20,
      }),
      anilibertyHit({
        id: 20,
        title: { english: 'Frieren: Beyond Journey\'s End', other: null },
        year: 2023,
        totalEpisodes: 28,
      }),
    ];
    const hints: CatalogHints = { seasonYear: 2023, episodeCount: 28 };

    const picked = pickBestAnilibertySearchHit(hits, hints, terms);

    expect(picked?.id).toBe(20);
  });
});
