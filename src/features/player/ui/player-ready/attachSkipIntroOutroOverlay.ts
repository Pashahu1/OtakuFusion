import type Artplayer from 'artplayer';
import type { StreamingData } from '@/shared/types/StreamingTypes';

import { SKIP_HOVER_CLASS } from '../player-layers/skipIntroOutroLayer';

export function attachSkipIntroOutroOverlay(
  art: Artplayer,
  skipSegments: StreamingData['skipSegments'] | null | undefined,
): () => void {
  const introSeg = skipSegments?.intro;
  const introSkipOk =
    introSeg != null &&
    typeof introSeg.start === 'number' &&
    typeof introSeg.end === 'number' &&
    introSeg.start < introSeg.end;

  const skipRoot = art.layers['skipIntroOutro'] as HTMLDivElement | undefined;
  const player = art.template.$player;
  let skipOverlayVisible = false;

  if (skipRoot && player instanceof HTMLElement && skipRoot.parentElement !== player) {
    player.appendChild(skipRoot);
  }

  const clearSkipHover = () => {
    if (player instanceof HTMLElement) player.classList.remove(SKIP_HOVER_CLASS);
  };

  const hide = () => {
    if (!skipRoot || !skipOverlayVisible) return;
    skipRoot.style.display = 'none';
    skipRoot.style.pointerEvents = 'none';
    skipOverlayVisible = false;
    clearSkipHover();
  };

  const seekToIntroEnd = () => {
    if (!introSkipOk || !introSeg) return;
    const dur = art.video?.duration ?? art.duration;
    const target =
      Number.isFinite(dur) && dur > 0
        ? Math.min(introSeg.end, Math.max(0, dur - 0.05))
        : introSeg.end;
    art.currentTime = target;
  };

  const skipBtn = skipRoot?.querySelector<HTMLButtonElement>('[data-skip-segment]');

  if (skipRoot && skipBtn && !skipRoot.dataset.ofSkipSegmentBound) {
    skipRoot.dataset.ofSkipSegmentBound = '1';
    skipBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      seekToIntroEnd();
      hide();
    });
    skipBtn.addEventListener('pointerenter', () => {
      if (player instanceof HTMLElement) player.classList.add(SKIP_HOVER_CLASS);
    });
    skipBtn.addEventListener('pointerleave', clearSkipHover);
    skipBtn.addEventListener('focus', () => {
      if (player instanceof HTMLElement) player.classList.add(SKIP_HOVER_CLASS);
    });
    skipBtn.addEventListener('blur', clearSkipHover);
  }

  const syncSkipSegmentOverlay = (t: number) => {
    if (!skipRoot || !introSkipOk || !introSeg) {
      hide();
      return;
    }

    const inIntro = t >= introSeg.start && t < introSeg.end;
    if (!inIntro) {
      hide();
      return;
    }

    if (!skipOverlayVisible) {
      skipRoot.style.display = 'block';
      skipRoot.style.pointerEvents = 'none';
      skipOverlayVisible = true;
    }
  };

  const onTimeUpdate = () => {
    syncSkipSegmentOverlay(art.currentTime);
  };

  art.on('video:timeupdate', onTimeUpdate);

  return () => {
    clearSkipHover();
    const emitter = art as unknown as {
      off?: (event: string, handler: () => void) => void;
    };
    emitter.off?.('video:timeupdate', onTimeUpdate);
  };
}
