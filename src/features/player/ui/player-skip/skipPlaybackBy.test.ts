import { describe, expect, it } from 'vitest';

import { clampPlaybackTime, skipPlaybackBy } from './skipPlaybackBy';

describe('clampPlaybackTime', () => {
  it('clamps to the duration window', () => {
    expect(clampPlaybackTime(-4, 100)).toBe(0);
    expect(clampPlaybackTime(99.99, 100)).toBe(99.95);
    expect(clampPlaybackTime(12, Number.NaN)).toBe(12);
  });
});

describe('skipPlaybackBy', () => {
  it('seeks forward and backward by the given delta', () => {
    const art = { currentTime: 40, duration: 100 };
    expect(skipPlaybackBy(art, 10)).toBe(50);
    expect(art.currentTime).toBe(50);
    expect(skipPlaybackBy(art, -10)).toBe(40);
  });
});
