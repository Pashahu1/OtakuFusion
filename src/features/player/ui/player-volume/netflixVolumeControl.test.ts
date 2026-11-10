/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';

import {
  bindNetflixVolumeControl,
  NETFLIX_VOLUME_CONTROL_HTML,
} from './netflixVolumeControl';

function mountVolumeControl(volume = 0.8, muted = false) {
  const root = document.createElement('div');
  root.innerHTML = NETFLIX_VOLUME_CONTROL_HTML;
  const art = {
    muted,
    volume,
    on: vi.fn(),
  };
  bindNetflixVolumeControl(art as never, root);
  const slider = root.querySelector<HTMLInputElement>('.of-volume__slider');
  const toggle = root.querySelector<HTMLButtonElement>('.of-volume__toggle');
  if (!slider || !toggle) throw new Error('volume control markup is incomplete');
  return { art, slider, toggle };
}

describe('bindNetflixVolumeControl', () => {
  it('syncs the horizontal slider to the current volume', () => {
    const { slider } = mountVolumeControl(0.42);
    expect(slider.value).toBe('42');
    expect(slider.style.getPropertyValue('--of-volume')).toBe('42%');
  });

  it('mutes from the toggle and restores a usable volume', () => {
    const { art, slider, toggle } = mountVolumeControl(0.8);
    toggle.click();
    expect(art.muted).toBe(true);
    expect(slider.value).toBe('0');

    toggle.click();
    expect(art.muted).toBe(false);
    expect(art.volume).toBe(0.8);
  });

  it('applies slider input as a 0-1 volume', () => {
    const { art, slider } = mountVolumeControl();
    slider.value = '25';
    slider.dispatchEvent(new Event('input'));
    expect(art.volume).toBe(0.25);
    expect(art.muted).toBe(false);
  });
});
