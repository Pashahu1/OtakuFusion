import { describe, expect, it } from 'vitest';

import { shouldHidePlayerChrome } from './shouldHidePlayerChrome';

const idle = {
  isPlaying: true,
  isDestroyed: false,
  isSettingOpen: false,
  isInput: false,
  isPointerDown: false,
  isTracksPanelOpen: false,
};

describe('shouldHidePlayerChrome', () => {
  it('hides after idle while playing even if the cursor is still over the player', () => {
    expect(shouldHidePlayerChrome(idle)).toBe(true);
  });

  it('keeps chrome when paused so the timeline stays usable', () => {
    expect(shouldHidePlayerChrome({ ...idle, isPlaying: false })).toBe(false);
  });

  it('keeps chrome while dragging or a panel is open', () => {
    expect(shouldHidePlayerChrome({ ...idle, isPointerDown: true })).toBe(false);
    expect(shouldHidePlayerChrome({ ...idle, isTracksPanelOpen: true })).toBe(false);
    expect(shouldHidePlayerChrome({ ...idle, isSettingOpen: true })).toBe(false);
  });
});
