import { createDesktopVideoToggleLayer } from './player-layers/desktopVideoToggleLayer';
import { createMobileInteractionLayers } from './player-layers/mobileInteractionLayers';
import { createSiteLogoLayer } from './player-layers/siteLogoLayer';
import { createSkipIntroOutroLayer } from './player-layers/skipIntroOutroLayer';

export function getPlayerLayers(userPausedRef: React.RefObject<boolean>) {
  return [
    createSiteLogoLayer(),
    ...createMobileInteractionLayers(userPausedRef),
    createDesktopVideoToggleLayer(userPausedRef),
    createSkipIntroOutroLayer(),
  ];
}
