import type Artplayer from 'artplayer';

import { TRACKS_PANEL_CLASS } from '../player-layers/tracksPanelLayer';
import {
  getPanelElement,
  getTracksPanelModel,
  setTracksPanelOpen,
  toggleTracksPanel,
} from './tracksPanelModel';

export function attachNetflixTracksPanel(art: Artplayer): () => void {
  const layer = art.layers.tracksPanel as HTMLElement | undefined;
  if (!layer) return () => undefined;

  const onLayerClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>(`.${TRACKS_PANEL_CLASS}__item`);
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const kind = button.dataset.trackKind;
    const id = button.dataset.trackId;
    if (!kind || !id) return;
    if (button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    const model = getTracksPanelModel(art);
    if (!model) return;
    if (kind === 'audio') {
      if (model.audio.some((item) => item.id === id && item.active)) return;
      model.onSelectAudio(id);
      return;
    }
    if (kind === 'quality') {
      if (model.quality.some((item) => item.id === id && item.active)) return;
      model.onSelectQuality(id);
      return;
    }
    if (kind === 'enhance') {
      if (model.enhance.some((item) => item.id === id && item.active)) return;
      model.onSelectEnhance(id);
      return;
    }
    if (model.subtitles.some((item) => item.id === id && item.active)) return;
    model.onSelectSubtitle(id);
  };

  const onDocumentPointer = (event: Event) => {
    const panel = getPanelElement(art);
    if (!panel || panel.hidden) return;
    const target = event.target as Node | null;
    if (!target) return;
    if (panel.contains(target)) return;
    if ((target as HTMLElement).closest?.('.art-control-audioSubtitles')) return;
    setTracksPanelOpen(art, false);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    if (!getPanelElement(art) || getPanelElement(art)?.hidden) return;
    setTracksPanelOpen(art, false);
  };

  art.proxy(layer as HTMLDivElement, 'click', onLayerClick);
  document.addEventListener('pointerdown', onDocumentPointer, true);
  document.addEventListener('keydown', onKeydown);

  return () => {
    document.removeEventListener('pointerdown', onDocumentPointer, true);
    document.removeEventListener('keydown', onKeydown);
    setTracksPanelOpen(art, false);
  };
}

export function clickAudioSubtitlesControl(art: Artplayer, event?: Event): void {
  event?.preventDefault();
  event?.stopPropagation();
  toggleTracksPanel(art);
}
