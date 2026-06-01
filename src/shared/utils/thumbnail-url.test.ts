import { describe, expect, it } from 'vitest';

import {
  anilistCoverUrl,
  isAniListCdnHost,
  nextImageProxyUrl,
  thumbnailUrl,
} from './thumbnail-url';

describe('thumbnail-url', () => {
  const largeCover =
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx11061-y5gs.png';

  it('detects AniList CDN hosts', () => {
    expect(isAniListCdnHost(largeCover)).toBe(true);
    expect(isAniListCdnHost('https://cdn.example.com/a.jpg')).toBe(false);
  });

  it('downscales AniList covers to medium for list cards', () => {
    expect(thumbnailUrl(largeCover)).toBe(
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx11061-y5gs.png',
    );
  });

  it('keeps large AniList covers for hero poster fallback', () => {
    expect(thumbnailUrl(largeCover, '1200x1800')).toBe(largeCover);
  });

  it('normalizes extraLarge to medium for cards', () => {
    const extraLarge =
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/extraLarge/bx1-x.png';
    expect(anilistCoverUrl(extraLarge, 'medium')).toContain('/cover/medium/');
  });

  it('builds same-origin proxy URL for accent sampling', () => {
    const src = 'https://artworks.thetvdb.com/banners/x.jpg';
    expect(nextImageProxyUrl(src, 48, 40)).toBe(
      '/_next/image?url=https%3A%2F%2Fartworks.thetvdb.com%2Fbanners%2Fx.jpg&w=48&q=40',
    );
  });
});
