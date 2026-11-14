import { describe, expect, it } from 'vitest';

import {
  DEFAULT_WATCH_STREAM_PROVIDER,
  normalizeWatchStreamProvider,
} from './watch-provider';

describe('watch provider lock', () => {
  it('always remaps to Hikka', () => {
    expect(DEFAULT_WATCH_STREAM_PROVIDER).toBe('hikka');
    expect(normalizeWatchStreamProvider('anikoto')).toBe('hikka');
    expect(normalizeWatchStreamProvider('hikka')).toBe('hikka');
    expect(normalizeWatchStreamProvider('aniliberty')).toBe('hikka');
    expect(normalizeWatchStreamProvider(null)).toBe('hikka');
  });
});
