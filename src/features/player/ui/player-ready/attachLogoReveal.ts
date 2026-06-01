import type Artplayer from 'artplayer';
import { LOGO_HIDE_DELAY_MS } from '../playerConstants';

export function attachLogoReveal(art: Artplayer): () => void {
  const logoLayer = art.layers.siteLogo as HTMLElement | undefined;
  let logoHideTimeoutId: ReturnType<typeof setTimeout> | null = null;

  requestAnimationFrame(() => {
    if (!logoLayer) return;
    logoLayer.style.opacity = '1';
    logoLayer.style.transform = 'translateY(0) scale(1)';
  });

  logoHideTimeoutId = setTimeout(() => {
    if (!logoLayer) return;
    logoLayer.style.opacity = '0';
    logoLayer.style.transform = 'translateY(-10px) scale(0.95)';
  }, LOGO_HIDE_DELAY_MS);

  return () => {
    if (logoHideTimeoutId) {
      clearTimeout(logoHideTimeoutId);
      logoHideTimeoutId = null;
    }
  };
}
