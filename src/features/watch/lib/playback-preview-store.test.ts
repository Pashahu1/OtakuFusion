import { describe, expect, it } from 'vitest';

import { episodePreviewKey } from '@/features/watch/lib/playback-preview-store';

describe('episodePreviewKey', () => {
  it('builds a stable storage key from anime and episode ids', () => {
    expect(episodePreviewKey('195600', '3')).toBe('ep:195600:3');
    expect(episodePreviewKey(' 195600 ', ' 3 ')).toBe('ep:195600:3');
  });
});
