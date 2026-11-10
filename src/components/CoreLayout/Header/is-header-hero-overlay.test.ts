import { describe, expect, it } from 'vitest';

import { isHeaderHeroOverlayPath } from './is-header-hero-overlay';

describe('isHeaderHeroOverlayPath', () => {
  it('treats home and series pages as hero overlays', () => {
    expect(isHeaderHeroOverlayPath('/')).toBe(true);
    expect(isHeaderHeroOverlayPath('/watch/195604')).toBe(true);
  });

  it('keeps a solid bar on catalog and auth routes', () => {
    expect(isHeaderHeroOverlayPath('/watch/195604/play')).toBe(false);
    expect(isHeaderHeroOverlayPath('/search')).toBe(false);
    expect(isHeaderHeroOverlayPath('/discover/popular')).toBe(false);
    expect(isHeaderHeroOverlayPath('/auth/login')).toBe(false);
  });
});
