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

  it('switches Anikoto dub to English server', () => {
    const setWatchStreamProvider = vi.fn();
    const setActiveServerId = vi.fn();
    applyLanguageTrack(
      { __mode: 'anikoto-dub' },
      { setWatchStreamProvider, setActiveServerId },
    );
    expect(setWatchStreamProvider).toHaveBeenCalledWith('anikoto');
    expect(setActiveServerId).toHaveBeenCalledWith('2');
  });
});
