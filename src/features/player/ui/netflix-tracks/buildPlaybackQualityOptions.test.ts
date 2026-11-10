import { describe, expect, it } from 'vitest';

import {
  buildHlsLadderQualityOptions,
  buildVariantQualityOptions,
} from './buildPlaybackQualityOptions';

describe('buildHlsLadderQualityOptions', () => {
  const levels = [
    { height: 360, bitrate: 400_000 },
    { height: 720, bitrate: 2_000_000 },
    { height: 1080, bitrate: 6_000_000 },
  ];

  it('lists rungs tallest-first and marks the locked level', () => {
    const options = buildHlsLadderQualityOptions(levels, 2, false);
    expect(options.map((o) => o.label)).toEqual(['1080p', '720p', '360p', 'Auto']);
    expect(options.find((o) => o.id === 'hls:2')?.active).toBe(true);
    expect(options.find((o) => o.id === 'hls:auto')?.active).toBe(false);
  });

  it('marks Auto when ABR is on', () => {
    const options = buildHlsLadderQualityOptions(levels, -1, true);
    expect(options.find((o) => o.id === 'hls:auto')?.active).toBe(true);
    expect(options.filter((o) => o.active)).toHaveLength(1);
  });
});

describe('buildVariantQualityOptions', () => {
  it('needs at least two playlists', () => {
    expect(
      buildVariantQualityOptions(
        [{ height: 1080, url: 'https://cdn.example/1080.m3u8', label: '1080p' }],
        'https://cdn.example/1080.m3u8',
      ),
    ).toEqual([]);
  });
});
