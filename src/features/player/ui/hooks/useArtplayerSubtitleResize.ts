import type Artplayer from 'artplayer';

type ArtplayerWithSubtitleRaf = Artplayer & { __subtitleResizeRaf?: number };

/** Adaptive subtitle size when player dimensions change. */
export function attachArtplayerSubtitleResize(art: Artplayer) {
  art.on('resize', () => {
    const typed = art as ArtplayerWithSubtitleRaf;
    if (typed.__subtitleResizeRaf) {
      cancelAnimationFrame(typed.__subtitleResizeRaf);
    }
    typed.__subtitleResizeRaf = requestAnimationFrame(() => {
      art.subtitle.style({
        fontSize: (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
      });
    });
  });
}

export function clearArtplayerSubtitleResizeRaf(instance: Artplayer) {
  const resizeRaf = (instance as ArtplayerWithSubtitleRaf).__subtitleResizeRaf;
  if (resizeRaf) {
    cancelAnimationFrame(resizeRaf);
    (instance as ArtplayerWithSubtitleRaf).__subtitleResizeRaf = undefined;
  }
}
