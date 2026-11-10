import type Artplayer from 'artplayer';

import { NOW_PLAYING_LAYER_CLASS } from '../player-layers/nowPlayingLayer';

export interface NowPlayingOverlayCopy {
  title: string;
  episodeLabel: string;
}

function mountNowPlayingInControls(art: Artplayer, layer: HTMLElement): HTMLElement {
  const inner =
    layer.querySelector<HTMLElement>(`.${NOW_PLAYING_LAYER_CLASS}`) ?? layer;
  const controls = art.template.$controls as HTMLElement | undefined;
  if (controls && inner.parentElement !== controls) {
    controls.appendChild(inner);
  }
  return inner;
}

export function attachNowPlayingOverlay(
  art: Artplayer,
  copy: NowPlayingOverlayCopy,
): void {
  const layer = art.layers.nowPlaying as HTMLElement | undefined;
  if (!layer) return;

  const root = mountNowPlayingInControls(art, layer);
  const titleEl = root.querySelector<HTMLElement>('[data-now-playing-title]');
  const episodeEl = root.querySelector<HTMLElement>('[data-now-playing-ep]');
  const title = copy.title.trim();
  const episodeLabel = copy.episodeLabel.trim();

  if (titleEl) titleEl.textContent = title;
  if (episodeEl) {
    episodeEl.textContent = title && episodeLabel ? ` ${episodeLabel}` : episodeLabel;
    episodeEl.hidden = !episodeLabel;
  }

  const isEmpty = !title && !episodeLabel;
  root.classList.toggle(`${NOW_PLAYING_LAYER_CLASS}--empty`, isEmpty);
  layer.classList.toggle(`${NOW_PLAYING_LAYER_CLASS}--empty`, isEmpty);
  if (root.parentElement === (art.template.$controls as HTMLElement | undefined)) {
    layer.style.display = 'none';
  }
}
