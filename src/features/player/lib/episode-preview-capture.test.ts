import { describe, expect, it } from 'vitest';

import {
  averageLumaFromRgba,
  episodePreviewCaptureAtSeconds,
  isLumaTooDark,
} from './episode-preview-capture';

describe('episodePreviewCaptureAtSeconds', () => {
  it('picks a mid-episode time that differs between episode keys', () => {
    const duration = 1440;
    const first = episodePreviewCaptureAtSeconds('1', duration);
    const second = episodePreviewCaptureAtSeconds('8', duration);

    expect(first).toBeGreaterThanOrEqual(duration * 0.15);
    expect(first).toBeLessThanOrEqual(duration * 0.72);
    expect(second).not.toBe(first);
  });

  it('stays inside a short episode', () => {
    expect(episodePreviewCaptureAtSeconds('3', 40)).toBeGreaterThan(0);
    expect(episodePreviewCaptureAtSeconds('3', 40)).toBeLessThan(40);
  });
});

describe('luma helpers', () => {
  it('rejects near-black frames', () => {
    expect(isLumaTooDark(averageLumaFromRgba([4, 4, 4, 255, 2, 2, 2, 255], 1))).toBe(
      true,
    );
    expect(isLumaTooDark(averageLumaFromRgba([180, 160, 90, 255], 1))).toBe(false);
  });
});
