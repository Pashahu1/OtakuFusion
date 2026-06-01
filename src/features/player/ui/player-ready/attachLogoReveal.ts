import type Artplayer from 'artplayer';

import { LOGO_FADE_OUT_MS, LOGO_HIDE_DELAY_MS } from '../playerConstants';
import { SITE_LOGO_LAYER_CLASS } from '../player-layers/siteLogoLayer';

export function attachLogoReveal(art: Artplayer): () => void {
  const logoLayer = art.layers.siteLogo as HTMLElement | undefined;
  let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let fadeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  if (logoLayer) {
    logoLayer.classList.add(SITE_LOGO_LAYER_CLASS);
  }

  requestAnimationFrame(() => {
    if (!logoLayer) return;
    logoLayer.style.visibility = 'visible';
    logoLayer.classList.add(`${SITE_LOGO_LAYER_CLASS}--visible`);
  });

  hideTimeoutId = setTimeout(() => {
    if (!logoLayer) return;
    logoLayer.classList.remove(`${SITE_LOGO_LAYER_CLASS}--visible`);
    logoLayer.classList.add(`${SITE_LOGO_LAYER_CLASS}--hiding`);

    fadeTimeoutId = setTimeout(() => {
      if (!logoLayer) return;
      logoLayer.style.visibility = 'hidden';
    }, LOGO_FADE_OUT_MS);
  }, LOGO_HIDE_DELAY_MS);

  return () => {
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
    if (fadeTimeoutId) {
      clearTimeout(fadeTimeoutId);
      fadeTimeoutId = null;
    }
  };
}
