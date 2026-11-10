import { describe, expect, it } from 'vitest';

import { formatNowPlayingEpisode } from './nowPlayingLayer';

describe('formatNowPlayingEpisode', () => {
  it('prefers titled episode labels', () => {
    expect(formatNowPlayingEpisode(8, 'Go! Go! First Mission')).toBe(
      'E8: Go! Go! First Mission',
    );
    expect(formatNowPlayingEpisode(8, 'Episode 8 - Go! Go! First Mission')).toBe(
      'E8: Go! Go! First Mission',
    );
  });

  it('falls back to a generic episode label', () => {
    expect(formatNowPlayingEpisode(8)).toBe('E8');
    expect(formatNowPlayingEpisode(null)).toBe('');
  });
});
