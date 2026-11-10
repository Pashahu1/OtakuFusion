import { describe, expect, it } from 'vitest';

import {
  nextEligibleWatchPlaybackProvider,
  nextWatchStreamProvider,
  WATCH_PROVIDER_FALLBACK_ORDER,
} from './watch-provider-fallback';

describe('watch provider fallback', () => {
  it('keeps Ukrainian provider after Japanese/English, not before', () => {
    expect(WATCH_PROVIDER_FALLBACK_ORDER).toEqual(['anikoto', 'hikka']);
  });

  it('skips locked Anikoto and keeps Hikka independent', () => {
    expect(nextWatchStreamProvider('anikoto')).toBe('hikka');
    expect(nextWatchStreamProvider('hikka')).toBeNull();
  });

  it('does not fall back from Hikka when it is the last eligible provider', () => {
    expect(
      nextEligibleWatchPlaybackProvider({
        current: 'hikka',
        hikkaLanguageMenuEligible: true,
      }),
    ).toBeNull();
    expect(
      nextEligibleWatchPlaybackProvider({
        current: 'hikka',
        hikkaLanguageMenuEligible: false,
      }),
    ).toBeNull();
  });
});
