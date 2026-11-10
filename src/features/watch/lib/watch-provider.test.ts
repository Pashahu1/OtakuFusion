import { describe, expect, it } from 'vitest';

import {
  DEFAULT_WATCH_STREAM_PROVIDER,
  normalizeWatchStreamProvider,
} from './watch-provider';

describe('watch provider lock', () => {
  it('defaults to Hikka and remaps saved Anikoto while JP/EN are locked', () => {
    expect(DEFAULT_WATCH_STREAM_PROVIDER).toBe('hikka');
    expect(normalizeWatchStreamProvider('anikoto')).toBe('hikka');
    expect(normalizeWatchStreamProvider('hikka')).toBe('hikka');
    expect(normalizeWatchStreamProvider('aniliberty')).toBe(
      DEFAULT_WATCH_STREAM_PROVIDER,
    );
    expect(normalizeWatchStreamProvider('anilibria')).toBe(
      DEFAULT_WATCH_STREAM_PROVIDER,
    );
  });
});
