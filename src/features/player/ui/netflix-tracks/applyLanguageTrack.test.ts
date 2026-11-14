import { describe, expect, it, vi } from 'vitest';

import { applyLanguageTrack } from './applyLanguageTrack';

describe('applyLanguageTrack', () => {
  it('switches to Hikka Ukrainian', () => {
    const setWatchStreamProvider = vi.fn();
    const setActiveServerId = vi.fn();
    applyLanguageTrack(
      { __mode: 'hikka' },
      { setWatchStreamProvider, setActiveServerId },
    );
    expect(setWatchStreamProvider).toHaveBeenCalledWith('hikka');
    expect(setActiveServerId).not.toHaveBeenCalled();
  });
});
