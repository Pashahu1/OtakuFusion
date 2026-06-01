import { describe, expect, it } from 'vitest';
import { streamQualityRank } from './streamQualityRank';

describe('streamQualityRank', () => {
  it('parses resolution from quality labels', () => {
    expect(streamQualityRank('720p')).toBe(720);
    expect(streamQualityRank('1080p · Anilibria')).toBe(1080);
  });

  it('returns 0 for unknown labels', () => {
    expect(streamQualityRank('Auto')).toBe(0);
    expect(streamQualityRank(undefined)).toBe(0);
  });
});
