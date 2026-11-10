import type Artplayer from 'artplayer';

import { PLAYER_CHROME_IDLE_MS } from '../playerConstants';
import { isTracksPanelOpen } from '../netflix-tracks/tracksPanelModel';
import { shouldHidePlayerChrome } from './shouldHidePlayerChrome';

function readIdleState(art: Artplayer, isPointerDown: boolean) {
  return {
    isPlaying: art.playing,
    isDestroyed: art.isDestroy,
    isSettingOpen: Boolean(art.setting?.show),
    isInput: Boolean(art.isInput),
    isPointerDown,
    isTracksPanelOpen: isTracksPanelOpen(art),
  };
}

export function attachIdleChromeHide(art: Artplayer): () => void {
  const player = art.template.$player;
  if (!(player instanceof HTMLElement)) return () => {};

  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let isPointerDown = false;

  function clearIdleTimer() {
    if (!idleTimer) return;
    clearTimeout(idleTimer);
    idleTimer = null;
  }

  function hideIfIdle() {
    if (!shouldHidePlayerChrome(readIdleState(art, isPointerDown))) return;
    art.controls.show = false;
  }

  function bump() {
    if (art.isDestroy) return;
    if (!art.controls.show) art.controls.show = true;
    clearIdleTimer();
    idleTimer = setTimeout(hideIfIdle, PLAYER_CHROME_IDLE_MS);
  }

  function onPointerDown() {
    isPointerDown = true;
    bump();
  }

  function onPointerUp() {
    isPointerDown = false;
    bump();
  }

  player.addEventListener('mousemove', bump);
  player.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('keydown', bump);

  art.on('play', bump);
  art.on('pause', () => {
    clearIdleTimer();
    art.controls.show = true;
  });

  bump();

  return () => {
    clearIdleTimer();
    player.removeEventListener('mousemove', bump);
    player.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    window.removeEventListener('keydown', bump);
  };
}
