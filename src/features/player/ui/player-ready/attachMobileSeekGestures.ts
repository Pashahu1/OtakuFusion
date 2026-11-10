import type Artplayer from 'artplayer';
import ArtplayerRuntime from 'artplayer';

import { PLAYER_SKIP_SECONDS } from '../playerConstants';
import { skipPlaybackBy } from '../player-skip/skipPlaybackBy';

const DOUBLE_TAP_MS = 280;
const DOUBLE_TAP_DISTANCE_PX = 28;
const SEEK_FLASH_MS = 420;

function flashSeekLayer(layer: HTMLElement | undefined): void {
  if (!layer) return;
  layer.style.opacity = '1';
  layer.classList.add('of-seek-flash--active');
  window.setTimeout(() => {
    layer.style.opacity = '0';
    layer.classList.remove('of-seek-flash--active');
  }, SEEK_FLASH_MS);
}

function bindDoubleTap(
  art: Artplayer,
  target: HTMLDivElement,
  onDoubleTap: () => void,
): void {
  let lastTs = 0;
  let lastX = 0;
  let lastY = 0;

  art.proxy(target, 'pointerup', (event: Event) => {
    const pointer = event as PointerEvent;
    if (pointer.pointerType === 'mouse') return;

    const now = performance.now();
    const dx = pointer.clientX - lastX;
    const dy = pointer.clientY - lastY;
    const isDouble =
      now - lastTs < DOUBLE_TAP_MS &&
      dx * dx + dy * dy < DOUBLE_TAP_DISTANCE_PX * DOUBLE_TAP_DISTANCE_PX;

    if (isDouble) {
      pointer.preventDefault();
      lastTs = 0;
      onDoubleTap();
      return;
    }

    lastTs = now;
    lastX = pointer.clientX;
    lastY = pointer.clientY;
  });

  art.proxy(target, 'dblclick', (event: Event) => {
    event.preventDefault();
    onDoubleTap();
  });
}

export function attachMobileSeekGestures(art: Artplayer): void {
  if (!ArtplayerRuntime.utils.isMobile) return;

  const rewind = art.layers['rewind'] as HTMLDivElement | undefined;
  const forward = art.layers['forward'] as HTMLDivElement | undefined;
  const backFlash = art.layers['backwardIcon'] as HTMLDivElement | undefined;
  const forwardFlash = art.layers['forwardIcon'] as HTMLDivElement | undefined;

  if (rewind) {
    bindDoubleTap(art, rewind, () => {
      skipPlaybackBy(art, -PLAYER_SKIP_SECONDS);
      flashSeekLayer(backFlash);
    });
  }

  if (forward) {
    bindDoubleTap(art, forward, () => {
      skipPlaybackBy(art, PLAYER_SKIP_SECONDS);
      flashSeekLayer(forwardFlash);
    });
  }
}
