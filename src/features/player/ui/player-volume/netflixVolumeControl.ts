import type Artplayer from 'artplayer';

import { muteIcon, volumeIcon } from '../PlayerIcons';

export const NETFLIX_VOLUME_CONTROL_HTML = `
  <div class="of-volume">
    <button type="button" class="of-volume__toggle" aria-label="Mute">
      <span class="of-volume__icon">${volumeIcon}</span>
    </button>
    <label class="of-volume__rail">
      <input
        type="range"
        class="of-volume__slider"
        min="0"
        max="100"
        step="1"
        aria-label="Volume"
      />
    </label>
  </div>
`;

export function bindNetflixVolumeControl(art: Artplayer, root: HTMLElement): void {
  const toggle = root.querySelector<HTMLButtonElement>('.of-volume__toggle');
  const icon = root.querySelector<HTMLElement>('.of-volume__icon');
  const slider = root.querySelector<HTMLInputElement>('.of-volume__slider');
  if (!toggle || !icon || !slider) return;

  const stop = (event: Event) => event.stopPropagation();

  const sync = () => {
    const muted = art.muted || art.volume <= 0.001;
    const percent = Math.round((muted ? 0 : art.volume) * 100);
    slider.value = String(percent);
    slider.style.setProperty('--of-volume', `${percent}%`);
    icon.innerHTML = muted ? muteIcon : volumeIcon;
    toggle.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    root.classList.toggle('of-volume--muted', muted);
  };

  root.addEventListener('click', stop);
  root.addEventListener('mousedown', stop);
  root.addEventListener('pointerdown', stop);

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    art.muted = !art.muted;
    if (!art.muted && art.volume <= 0.001) art.volume = 0.5;
    sync();
  });

  slider.addEventListener('input', () => {
    const next = Number(slider.value) / 100;
    art.muted = next <= 0;
    art.volume = next;
    sync();
  });

  art.on('video:volumechange', sync);
  art.on('muted', sync);
  sync();
}
