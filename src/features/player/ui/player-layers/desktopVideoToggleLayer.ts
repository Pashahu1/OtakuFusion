import Artplayer from 'artplayer';

import { bindPlayPauseLayerClick } from './playPauseClick';

export function createDesktopVideoToggleLayer(userPausedRef: React.RefObject<boolean>) {
  return {
    name: 'videoToggle',
    html: '',
    style: {
      position: 'absolute',
      inset: '0',
      zIndex: '100',
      cursor: 'pointer',
    },
    disable: Artplayer.utils.isMobile,
    click: bindPlayPauseLayerClick(userPausedRef),
  };
}
