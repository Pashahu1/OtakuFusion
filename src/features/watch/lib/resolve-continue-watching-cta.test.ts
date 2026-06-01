import { describe, expect, it } from 'vitest';

import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';

import {
  buildWatchCtaModel,
  findContinueWatchingEntry,
  pickContinueEpisodeNumber,
  resolveWatchCtaModel,
} from './resolve-continue-watching-cta';

const episodes = [
  { id: 'ep-1', episode_no: 1 },
  { id: 'ep-2', episode_no: 2 },
  { id: 'ep-3', episode_no: 3 },
];

const continueEntry: ContinueWatchingEntry = {
  id: '195600',
  data_id: 195600,
  episodeId: 'ep-2',
  episodeNum: 2,
  updatedAt: 1,
};

describe('findContinueWatchingEntry', () => {
  it('matches by anime id or data_id', () => {
    expect(findContinueWatchingEntry([continueEntry], '195600')).toBe(continueEntry);
    expect(findContinueWatchingEntry([continueEntry], 'other', 195600)).toBe(continueEntry);
    expect(findContinueWatchingEntry([continueEntry], 'missing')).toBeUndefined();
  });
});

describe('pickContinueEpisodeNumber', () => {
  it('prefers URL episode override', () => {
    expect(
      pickContinueEpisodeNumber('5', continueEntry, {}, episodes),
    ).toBe('5');
  });

  it('uses continue watching when episode exists in catalog', () => {
    expect(
      pickContinueEpisodeNumber(undefined, continueEntry, {}, episodes),
    ).toBe('2');
  });

  it('falls back to first unwatched episode', () => {
    expect(
      pickContinueEpisodeNumber(undefined, undefined, { '1': true }, episodes),
    ).toBe('2');
  });

  it('falls back to last episode when all watched', () => {
    expect(
      pickContinueEpisodeNumber(undefined, undefined, { '1': true, '2': true, '3': true }, episodes),
    ).toBe('3');
  });
});

describe('resolveWatchCtaModel', () => {
  it('builds continue CTA when progress exists', () => {
    const model = resolveWatchCtaModel({
      animeId: '195600',
      continueList: [continueEntry],
      watched: {},
      episodes,
    });

    expect(model).toEqual(
      buildWatchCtaModel('195600', '2', true),
    );
  });
});
