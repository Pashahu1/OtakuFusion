import type Artplayer from 'artplayer';
import ArtplayerRuntime from 'artplayer';

export function attachMobileSeekGestures(art: Artplayer): void {
  if (!ArtplayerRuntime.utils.isMobile) return;

  const $rewind = art.layers['rewind'] as HTMLDivElement | undefined;
  const $forward = art.layers['forward'] as HTMLDivElement | undefined;

  if ($rewind) {
    art.proxy($rewind, 'dblclick', () => {
      art.currentTime = Math.max(0, art.currentTime - 10);
      art.layers['backwardIcon'].style.opacity = '1';
      setTimeout(() => {
        art.layers['backwardIcon'].style.opacity = '0';
      }, 300);
    });
  }

  if ($forward) {
    art.proxy($forward, 'dblclick', () => {
      art.currentTime = Math.max(0, art.currentTime + 10);
      art.layers['forwardIcon'].style.opacity = '1';
      setTimeout(() => {
        art.layers['forwardIcon'].style.opacity = '0';
      }, 300);
    });
  }
}
