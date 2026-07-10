import type Artplayer from 'artplayer';

export interface UpNextOverlaySession {
  show: (title: string) => void;
  hide: () => void;
  clear: () => void;
}

export function attachUpNextOverlay(
  art: Artplayer,
  onPlayNext: () => void,
): UpNextOverlaySession {
  const root = art.layers['upNext'] as HTMLDivElement | undefined;
  let visible = false;

  const titleEl = root?.querySelector('[data-up-next-title]') as HTMLSpanElement | null;
  const playBtn = root?.querySelector('[data-up-next-play]') as HTMLButtonElement | null;

  const hide = () => {
    if (!root || !visible) return;
    root.style.display = 'none';
    root.style.pointerEvents = 'none';
    visible = false;
  };

  const show = (title: string) => {
    if (!root) return;
    if (titleEl) titleEl.textContent = title;
    if (!visible) {
      root.style.display = 'block';
      root.style.pointerEvents = 'auto';
      visible = true;
    }
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
  }

  return {
    show,
    hide,
    clear: () => {
      hide();
      playBtn?.removeEventListener('click', onPlayClick);
    },
  };
}
