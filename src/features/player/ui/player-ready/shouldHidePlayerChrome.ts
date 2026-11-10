export interface PlayerChromeIdleState {
  isPlaying: boolean;
  isDestroyed: boolean;
  isSettingOpen: boolean;
  isInput: boolean;
  isPointerDown: boolean;
  isTracksPanelOpen: boolean;
}

export function shouldHidePlayerChrome(state: PlayerChromeIdleState): boolean {
  if (state.isDestroyed) return false;
  if (!state.isPlaying) return false;
  if (state.isSettingOpen || state.isInput || state.isPointerDown || state.isTracksPanelOpen) {
    return false;
  }
  return true;
}
