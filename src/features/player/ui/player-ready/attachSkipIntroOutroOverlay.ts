import type Artplayer from 'artplayer';
import type { StreamingData } from '@/shared/types/StreamingTypes';
import { shouldSuppressOutroSkipForUpNext } from '@/features/player/lib/episode-end-thresholds';
import { readArtplayerHasNextEpisode } from '@/features/player/lib/artplayer-near-end-state';

export function attachSkipIntroOutroOverlay(
  art: Artplayer,
  skipSegments: StreamingData['skipSegments'] | null | undefined
): () => void {
  const introSeg = skipSegments?.intro;
  const outroSeg = skipSegments?.outro;
  const introSkipOk =
    introSeg != null &&
    typeof introSeg.start === 'number' &&
    typeof introSeg.end === 'number' &&
    introSeg.start < introSeg.end;
  const outroSkipOk =
    outroSeg != null &&
    typeof outroSeg.start === 'number' &&
    typeof outroSeg.end === 'number' &&
    outroSeg.start < outroSeg.end;

  const seekClampedToDuration = (seconds: number) => {
    const dur = art.video?.duration ?? art.duration;
    const target =
      Number.isFinite(dur) && dur > 0
        ? Math.min(seconds, Math.max(0, dur - 0.05))
        : seconds;
    art.currentTime = target;
  };

  const skipRoot = art.layers['skipIntroOutro'] as HTMLDivElement | undefined;
  let skipOverlayVisible = false;

  if (skipRoot && !skipRoot.dataset.ofSkipSegmentBound) {
    skipRoot.dataset.ofSkipSegmentBound = '1';
    skipRoot.querySelector('[data-skip-segment]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const kind = skipRoot.dataset.activeKind;
      if (kind === 'intro' && introSkipOk && introSeg) {
        seekClampedToDuration(introSeg.end);
      } else if (kind === 'outro' && outroSkipOk && outroSeg) {
        seekClampedToDuration(outroSeg.end);
      }
      skipRoot.style.display = 'none';
      skipRoot.style.pointerEvents = 'none';
      skipOverlayVisible = false;
      delete skipRoot.dataset.activeKind;
    });
  }

  const syncSkipSegmentOverlay = (t: number) => {
    if (!skipRoot || (!introSkipOk && !outroSkipOk)) {
      if (skipRoot && skipOverlayVisible) {
        skipRoot.style.display = 'none';
        skipRoot.style.pointerEvents = 'none';
        skipOverlayVisible = false;
        delete skipRoot.dataset.activeKind;
      }
      return;
    }

    let nextKind: 'intro' | 'outro' | null = null;
    if (introSkipOk && introSeg && t >= introSeg.start && t < introSeg.end) {
      nextKind = 'intro';
    } else if (outroSkipOk && outroSeg && t >= outroSeg.start && t < outroSeg.end) {
      const duration = art.video?.duration ?? art.duration;
      const suppressOutro =
        Number.isFinite(duration) &&
        duration > 0 &&
        shouldSuppressOutroSkipForUpNext(t, duration, readArtplayerHasNextEpisode(art));

      if (!suppressOutro) {
        nextKind = 'outro';
      }
    }

    if (nextKind === null) {
      if (skipOverlayVisible) {
        skipRoot.style.display = 'none';
        skipRoot.style.pointerEvents = 'none';
        skipOverlayVisible = false;
        delete skipRoot.dataset.activeKind;
      }
      return;
    }

    skipRoot.dataset.activeKind = nextKind;
    const btn = skipRoot.querySelector('[data-skip-segment]') as HTMLButtonElement | null;
    if (btn) btn.textContent = nextKind === 'intro' ? 'Skip OP' : 'Skip ED';
    if (!skipOverlayVisible) {
      skipRoot.style.display = 'flex';
      skipRoot.style.pointerEvents = 'auto';
      skipOverlayVisible = true;
    }
  };

  const onTimeUpdate = () => {
    syncSkipSegmentOverlay(art.currentTime);
  };

  art.on('video:timeupdate', onTimeUpdate);

  return () => {
    const emitter = art as unknown as {
      off?: (event: string, handler: () => void) => void;
    };
    emitter.off?.('video:timeupdate', onTimeUpdate);
  };
}
