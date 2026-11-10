import type Artplayer from 'artplayer';

import { getArtplayerNextEpisodeControl } from '@/features/player/lib/artplayer-near-end-state';

import { shouldShowUpNextCard } from './upNextCardVisibility';

export interface UpNextOverlayModel {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
}

export interface UpNextOverlaySession {
  setModel: (model: UpNextOverlayModel | null) => void;
  setPinned: (pinned: boolean) => void;
  clear: () => void;
}

const HOVER_HIDE_DELAY_MS = 120;

export function attachUpNextOverlay(
  art: Artplayer,
  onPlayNext: () => void,
): UpNextOverlaySession {
  const root = art.layers['upNext'] as HTMLDivElement | undefined;
  const playBtn = root?.querySelector<HTMLButtonElement>('[data-up-next-play]');
  const titleEl = root?.querySelector<HTMLElement>('[data-up-next-title]');
  const subtitleEl = root?.querySelector<HTMLElement>('[data-up-next-subtitle]');
  const imageEl = root?.querySelector<HTMLImageElement>('[data-up-next-image]');
  const control = getArtplayerNextEpisodeControl(art);

  let model: UpNextOverlayModel | null = null;
  let pinned = false;
  let hovering = false;
  let visible = false;
  let hideTimer: number | null = null;

  const applyModel = (next: UpNextOverlayModel) => {
    if (titleEl) titleEl.textContent = next.title;
    if (subtitleEl) {
      const subtitle = next.subtitle?.trim() ?? '';
      subtitleEl.textContent = subtitle;
      subtitleEl.hidden = subtitle.length === 0;
    }
    if (!imageEl) return;
    const imageUrl = next.imageUrl?.trim() ?? '';
    if (imageUrl) {
      imageEl.src = imageUrl;
      imageEl.hidden = false;
    } else {
      imageEl.removeAttribute('src');
      imageEl.hidden = true;
    }
  };

  const hide = () => {
    if (!root || !visible) return;
    root.style.display = 'none';
    root.style.pointerEvents = 'none';
    visible = false;
  };

  const show = () => {
    if (!root || !model) return;
    applyModel(model);
    if (visible) return;
    root.style.display = 'block';
    root.style.pointerEvents = 'none';
    if (playBtn) playBtn.style.pointerEvents = 'auto';
    visible = true;
  };

  const sync = () => {
    if (shouldShowUpNextCard(Boolean(model), pinned, hovering)) show();
    else hide();
  };

  const cancelHide = () => {
    if (hideTimer == null) return;
    window.clearTimeout(hideTimer);
    hideTimer = null;
  };

  const scheduleHoverHide = () => {
    cancelHide();
    hideTimer = window.setTimeout(() => {
      hideTimer = null;
      hovering = false;
      sync();
    }, HOVER_HIDE_DELAY_MS);
  };

  const onHoverStart = () => {
    if (!model) return;
    cancelHide();
    hovering = true;
    art.controls.show = true;
    sync();
  };

  const onPlayClick = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
    hide();
    onPlayNext();
  };

  if (playBtn && !playBtn.dataset.ofUpNextBound) {
    playBtn.dataset.ofUpNextBound = '1';
    playBtn.addEventListener('click', onPlayClick);
    playBtn.addEventListener('mouseenter', onHoverStart);
    playBtn.addEventListener('mouseleave', scheduleHoverHide);
  }

  if (control && !control.dataset.ofUpNextHoverBound) {
    control.dataset.ofUpNextHoverBound = '1';
    control.addEventListener('mouseenter', onHoverStart);
    control.addEventListener('focus', onHoverStart);
    control.addEventListener('mouseleave', scheduleHoverHide);
    control.addEventListener('blur', scheduleHoverHide);
  }

  return {
    setModel: (next) => {
      model = next;
      if (next) applyModel(next);
      sync();
    },
    setPinned: (nextPinned) => {
      pinned = nextPinned;
      sync();
    },
    clear: () => {
      cancelHide();
      hide();
      playBtn?.removeEventListener('click', onPlayClick);
      playBtn?.removeEventListener('mouseenter', onHoverStart);
      playBtn?.removeEventListener('mouseleave', scheduleHoverHide);
      control?.removeEventListener('mouseenter', onHoverStart);
      control?.removeEventListener('focus', onHoverStart);
      control?.removeEventListener('mouseleave', scheduleHoverHide);
      control?.removeEventListener('blur', scheduleHoverHide);
      if (playBtn) delete playBtn.dataset.ofUpNextBound;
      if (control) delete control.dataset.ofUpNextHoverBound;
    },
  };
}
