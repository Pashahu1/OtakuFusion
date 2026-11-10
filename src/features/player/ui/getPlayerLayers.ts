import { createDesktopVideoToggleLayer } from './player-layers/desktopVideoToggleLayer';
import { createMobileInteractionLayers } from './player-layers/mobileInteractionLayers';
import { createNowPlayingLayer } from './player-layers/nowPlayingLayer';
import { createSiteLogoLayer } from './player-layers/siteLogoLayer';
import { createSkipIntroOutroLayer } from './player-layers/skipIntroOutroLayer';
import { createTracksPanelLayer } from './player-layers/tracksPanelLayer';
import { createUpNextLayer } from './player-layers/upNextLayer';

export function getPlayerLayers(userPausedRef: React.RefObject<boolean>) {
  return [
    createSiteLogoLayer(),
    createNowPlayingLayer(),
    createTracksPanelLayer(),
    ...createMobileInteractionLayers(userPausedRef),
    createDesktopVideoToggleLayer(userPausedRef),
    createSkipIntroOutroLayer(),
    createUpNextLayer(),
  ];
}
