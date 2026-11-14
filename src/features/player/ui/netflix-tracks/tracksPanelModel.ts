import type Artplayer from 'artplayer';

import { TRACKS_PANEL_CLASS } from '../player-layers/tracksPanelLayer';

export interface TracksAudioOption {
  id: string;
  label: string;
  active: boolean;
  payload: Record<string, unknown>;
}

export interface TracksSubtitleOption {
  id: string;
  label: string;
  active: boolean;
  url: string;
}

export interface TracksQualityOption {
  id: string;
  label: string;
  active: boolean;
}

export interface TracksEnhanceOption {
  id: string;
  label: string;
  active: boolean;
}

export interface TracksPanelModel {
  audio: TracksAudioOption[];
  subtitles: TracksSubtitleOption[];
  quality: TracksQualityOption[];
  enhance: TracksEnhanceOption[];
  onSelectAudio: (id: string) => void;
  onSelectSubtitle: (id: string) => void;
  onSelectQuality: (id: string) => void;
  onSelectEnhance: (id: string) => void;
}

const models = new WeakMap<Artplayer, TracksPanelModel>();

export function getTracksPanelModel(art: Artplayer): TracksPanelModel | null {
  return models.get(art) ?? null;
}

export function patchTracksPanelModel(
  art: Artplayer,
  patch: Partial<TracksPanelModel>,
): void {
  const prev = models.get(art);
  const next: TracksPanelModel = {
    audio: prev?.audio ?? [],
    subtitles: prev?.subtitles ?? [],
    quality: prev?.quality ?? [],
    enhance: prev?.enhance ?? [],
    onSelectAudio: prev?.onSelectAudio ?? (() => undefined),
    onSelectSubtitle: prev?.onSelectSubtitle ?? (() => undefined),
    onSelectQuality: prev?.onSelectQuality ?? (() => undefined),
    onSelectEnhance: prev?.onSelectEnhance ?? (() => undefined),
    ...patch,
  };
  models.set(art, next);
  renderTracksPanel(art, next);
}

function revealActiveTrack(list: HTMLElement): void {
  const active = list.querySelector<HTMLElement>('[aria-current="true"]');
  if (!active) return;
  const nextTop = active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2;
  list.scrollTop = Math.max(0, nextTop);
}

function optionButton(
  option: { id: string; label: string; active: boolean },
  kind: 'audio' | 'sub' | 'quality' | 'enhance',
): string {
  const pressed = option.active ? 'true' : 'false';
  const activeClass = option.active ? ` ${TRACKS_PANEL_CLASS}__item--active` : '';
  const locked = option.active
    ? ' disabled aria-disabled="true" aria-current="true"'
    : '';
  return `<li>
    <button type="button" class="${TRACKS_PANEL_CLASS}__item${activeClass}" data-track-kind="${kind}" data-track-id="${escapeAttr(option.id)}" aria-pressed="${pressed}"${locked}>
      <span class="${TRACKS_PANEL_CLASS}__check" aria-hidden="true">${option.active ? '✓' : ''}</span>
      <span class="${TRACKS_PANEL_CLASS}__label">${escapeHtml(option.label)}</span>
    </button>
  </li>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}

export function renderTracksPanel(art: Artplayer, model: TracksPanelModel): void {
  const layer = art.layers.tracksPanel as HTMLElement | undefined;
  if (!layer) return;
  const audioList = layer.querySelector<HTMLElement>('[data-tracks-audio]');
  const subList = layer.querySelector<HTMLElement>('[data-tracks-subs]');
  const qualityList = layer.querySelector<HTMLElement>('[data-tracks-quality]');
  const enhanceList = layer.querySelector<HTMLElement>('[data-tracks-enhance]');
  if (audioList) {
    audioList.innerHTML = model.audio.map((item) => optionButton(item, 'audio')).join('');
  }
  if (subList) {
    subList.innerHTML = model.subtitles.map((item) => optionButton(item, 'sub')).join('');
    revealActiveTrack(subList);
  }
  if (qualityList) {
    qualityList.innerHTML = model.quality.map((item) => optionButton(item, 'quality')).join('');
  }
  const enhanceWrap = layer.querySelector<HTMLElement>('[data-tracks-enhance-wrap]');
  if (enhanceList) {
    enhanceList.innerHTML = model.enhance.map((item) => optionButton(item, 'enhance')).join('');
  }
  if (enhanceWrap) {
    enhanceWrap.hidden = model.enhance.length === 0;
  }
}

export function isTracksPanelOpen(art: Artplayer): boolean {
  const panel = getPanelElement(art);
  return Boolean(panel && !panel.hidden);
}

export function setTracksPanelOpen(art: Artplayer, open: boolean): void {
  const panel = getPanelElement(art);
  const layer = art.layers.tracksPanel as HTMLElement | undefined;
  if (!panel || !layer) return;
  panel.hidden = !open;
  layer.style.pointerEvents = open ? 'auto' : 'none';
  if (open) art.controls.show = true;
}

export function toggleTracksPanel(art: Artplayer): boolean {
  const next = !isTracksPanelOpen(art);
  setTracksPanelOpen(art, next);
  return next;
}

export function getPanelElement(art: Artplayer): HTMLElement | null {
  const layer = art.layers.tracksPanel as HTMLElement | undefined;
  return layer?.querySelector<HTMLElement>('[data-tracks-panel]') ?? null;
}
