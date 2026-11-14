import { describe, expect, it, vi } from 'vitest';

import { applyLanguageTrack } from './applyLanguageTrack';

describe('applyLanguageTrack', () => {
  it('switches to Hikka Ukrainian', () => {
    const setWatchStreamProvider = vi.fn();
    const setActiveServerId = vi.fn();
    const setPlaybackAudio = vi.fn();
    applyLanguageTrack(
      { __mode: 'hikka' },
      { setWatchStreamProvider, setActiveServerId, setPlaybackAudio },
    );
    expect(setPlaybackAudio).toHaveBeenCalledWith('uk');
    expect(setWatchStreamProvider).toHaveBeenCalledWith('hikka');
    expect(setActiveServerId).not.toHaveBeenCalled();
  });

  it('switches Japanese and English audio without replacing the catalog provider', () => {
    const setWatchStreamProvider = vi.fn();
    const setPlaybackAudio = vi.fn();
    applyLanguageTrack(
      { __mode: 'anikoto-ja' },
      { setWatchStreamProvider, setActiveServerId: vi.fn(), setPlaybackAudio },
    );
    applyLanguageTrack(
      { __mode: 'anikoto-en' },
      { setWatchStreamProvider, setActiveServerId: vi.fn(), setPlaybackAudio },
    );
    expect(setPlaybackAudio).toHaveBeenNthCalledWith(1, 'ja');
    expect(setPlaybackAudio).toHaveBeenNthCalledWith(2, 'en');
    expect(setWatchStreamProvider).not.toHaveBeenCalled();
  });
});
