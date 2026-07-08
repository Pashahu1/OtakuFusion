import { describe, expect, it } from 'vitest';

import { buildWatchUnavailableMessage } from './build-watch-unavailable-message';

describe('buildWatchUnavailableMessage', () => {
  it('prefers next episode schedule when available', () => {
    const message = buildWatchUnavailableMessage({
      nextEpisodeSchedule: { nextEpisodeSchedule: '2026-08-01T00:00:00.000Z' },
      releaseDate: '2026-07-01',
    });

    expect(message).toContain("hasn't aired yet");
    expect(message).toContain('Aug');
  });

  it('falls back to release date', () => {
    const message = buildWatchUnavailableMessage({
      nextEpisodeSchedule: null,
      releaseDate: '2026-09-15',
    });

    expect(message).toContain("hasn't released yet");
    expect(message).toContain('Sep');
  });

  it('uses generic copy when no dates are known', () => {
    expect(
      buildWatchUnavailableMessage({
        nextEpisodeSchedule: null,
        releaseDate: null,
      }),
    ).toBe('No episodes are available yet. Check back later.');
  });
});
