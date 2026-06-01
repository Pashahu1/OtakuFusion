import { describe, expect, it } from 'vitest';

import { pickPreferredQualityVariant } from './pickPreferredStreamQuality';

const variants = [
  { height: 1080, url: 'https://cdn.example/1080.m3u8' },
  { height: 720, url: 'https://cdn.example/720.m3u8' },
  { height: 480, url: 'https://cdn.example/480.m3u8' },
];

describe('pickPreferredQualityVariant', () => {
  it('prefers 1080p when available', () => {
    const picked = pickPreferredQualityVariant(variants, 'https://cdn.example/fallback.m3u8');
    expect(picked.url).toBe('https://cdn.example/1080.m3u8');
  });

  it('falls back to next lower when 1080 is missing', () => {
    const picked = pickPreferredQualityVariant(
      variants.filter((v) => v.height !== 1080),
      'https://cdn.example/fallback.m3u8',
    );
    expect(picked.url).toBe('https://cdn.example/720.m3u8');
  });
});
