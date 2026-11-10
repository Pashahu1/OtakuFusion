import { describe, expect, it } from 'vitest';

import { resolveLevelIndexForStoredQuality } from './hlsQualityStorage';

const levels = [
  { height: 360 },
  { height: 480 },
  { height: 720 },
  { height: 1080 },
];

describe('resolveLevelIndexForStoredQuality', () => {
  it('defaults to the highest rung when nothing is stored', () => {
    expect(resolveLevelIndexForStoredQuality(levels, null)).toBe(3);
    expect(
      resolveLevelIndexForStoredQuality([...levels, { height: 1440 }], null),
    ).toBe(4);
  });

  it('uses ABR for auto', () => {
    expect(resolveLevelIndexForStoredQuality(levels, 'auto')).toBe(-1);
  });

  it('locks an explicit height', () => {
    expect(resolveLevelIndexForStoredQuality(levels, { height: 720 })).toBe(2);
  });
});
