import { describe, expect, it } from 'vitest';

import {
  nextEligibleWatchPlaybackProvider,
  nextWatchStreamProvider,
  WATCH_PROVIDER_FALLBACK_ORDER,
} from './watch-provider-fallback';

describe('watch provider fallback', () => {
  it('only has Hikka', () => {
    expect(WATCH_PROVIDER_FALLBACK_ORDER).toEqual(['hikka']);
    expect(nextWatchStreamProvider('hikka')).toBeNull();
  });

  it('does not fall back from Hikka', () => {
    expect(
      nextEligibleWatchPlaybackProvider({
        current: 'hikka',
        hikkaLanguageMenuEligible: true,
      }),
    ).toBeNull();
  });
});
