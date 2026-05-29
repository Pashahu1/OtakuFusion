import { describe, expect, it } from 'vitest';
import {
  ANILIBERTY_EPISODE_COUNT_MAX_DELTA,
  isAnilibertyEpisodeCountAcceptable,
  isAnilibertyHitEligible,
  isAnilibertyReleaseOngoing,
  parseExpectedEpisodeCountFromHints,
  readAnilibertySearchEpisodeCount,
} from '@/lib/catalog/providers/aniliberty/anilibertyEpisodeMatch';
import type { CrysolineAnilibertySearchRow } from '@/server/crysoline/anilibertyClient';

describe('isAnilibertyEpisodeCountAcceptable', () => {
  it('allows any delta in lenient mode (ongoing / partial catalog)', () => {
    expect(
      isAnilibertyEpisodeCountAcceptable(24, 3, { isOngoing: true })
    ).toBe(true);
    expect(
      isAnilibertyEpisodeCountAcceptable(24, 3, { allowPartialCatalog: true })
    ).toBe(true);
  });

  it('skips check when expected count is missing', () => {
    expect(isAnilibertyEpisodeCountAcceptable(null, 12)).toBe(true);
    expect(isAnilibertyEpisodeCountAcceptable(0, 12)).toBe(true);
  });

  it('rejects missing or zero actual when expected is set', () => {
    expect(isAnilibertyEpisodeCountAcceptable(12, null)).toBe(false);
    expect(isAnilibertyEpisodeCountAcceptable(12, 0)).toBe(false);
  });

  it(`accepts ±${ANILIBERTY_EPISODE_COUNT_MAX_DELTA} for finished releases`, () => {
    expect(isAnilibertyEpisodeCountAcceptable(12, 12)).toBe(true);
    expect(isAnilibertyEpisodeCountAcceptable(12, 10)).toBe(true);
    expect(isAnilibertyEpisodeCountAcceptable(12, 14)).toBe(true);
  });

  it('rejects too few or too many episodes', () => {
    expect(isAnilibertyEpisodeCountAcceptable(12, 9)).toBe(false);
    expect(isAnilibertyEpisodeCountAcceptable(12, 15)).toBe(false);
  });
});

describe('readAnilibertySearchEpisodeCount', () => {
  it('returns floored positive integer or null', () => {
    expect(readAnilibertySearchEpisodeCount({ id: 1, totalEpisodes: 28 })).toBe(28);
    expect(readAnilibertySearchEpisodeCount({ id: 1, totalEpisodes: 0 })).toBeNull();
    expect(readAnilibertySearchEpisodeCount(null)).toBeNull();
  });
});

describe('isAnilibertyHitEligible', () => {
  const hit = (totalEpisodes: number, isOngoing = false): CrysolineAnilibertySearchRow => ({
    id: 1,
    totalEpisodes,
    metadata: { isOngoing },
  });

  it('allows hit when hints have no episodeCount', () => {
    expect(isAnilibertyHitEligible(hit(99), {})).toBe(true);
  });

  it('filters mismatched count for finished titles', () => {
    expect(
      isAnilibertyHitEligible(hit(28), { episodeCount: 12 })
    ).toBe(false);
    expect(
      isAnilibertyHitEligible(hit(12), { episodeCount: 12 })
    ).toBe(true);
  });

  it('allows lower count for ongoing / still airing', () => {
    expect(
      isAnilibertyHitEligible(hit(8), { episodeCount: 24, isStillAiring: true })
    ).toBe(true);
    expect(
      isAnilibertyHitEligible(hit(8, true), { episodeCount: 24 })
    ).toBe(true);
  });
});

describe('parseExpectedEpisodeCountFromHints', () => {
  it('normalizes positive integer', () => {
    expect(parseExpectedEpisodeCountFromHints({ episodeCount: 12.9 })).toBe(12);
    expect(parseExpectedEpisodeCountFromHints({ episodeCount: -1 })).toBeNull();
  });
});

describe('isAnilibertyReleaseOngoing', () => {
  it('reads metadata.isOngoing', () => {
    expect(isAnilibertyReleaseOngoing({ metadata: { isOngoing: true } })).toBe(true);
    expect(isAnilibertyReleaseOngoing({ metadata: { isOngoing: false } })).toBe(false);
  });
});
