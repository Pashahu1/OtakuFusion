import Artplayer from 'artplayer';

import { SITE_LOGO_INNER_HTML } from './siteLogoMarkup';

export const SITE_LOGO_LAYER_CLASS = 'otakufusion-player-logo-layer';

export function createSiteLogoLayer() {
  return {
    name: 'siteLogo',
    disable: Artplayer.utils.isMobile,
    html: SITE_LOGO_INNER_HTML,
    style: {
      position: 'absolute',
      top: '18px',
      right: '20px',
      pointerEvents: 'none',
      opacity: '0',
      visibility: 'hidden',
    },
  };
}
