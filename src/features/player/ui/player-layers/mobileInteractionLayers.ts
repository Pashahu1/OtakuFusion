import Artplayer from 'artplayer';

import { backwardIcon, forwardIcon } from '../PlayerIcons';

import { bindPlayPauseLayerClick, bindToggleControlsClick } from './playPauseClick';

export function createMobileInteractionLayers(userPausedRef: React.RefObject<boolean>) {
  const playPauseClick = bindPlayPauseLayerClick(userPausedRef);

  return [
    {
      html: '',
      style: {
        position: 'absolute',
        left: '50%',
        top: '0',
        width: '20%',
        height: '100%',
        transform: 'translateX(-50%)',
      },
      disable: !Artplayer.utils.isMobile,
      click: playPauseClick,
    },
    {
      name: 'rewind',
      html: '',
      style: {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '40%',
        height: '100%',
      },
      disable: !Artplayer.utils.isMobile,
      click: bindToggleControlsClick,
    },
    {
      name: 'forward',
      html: '',
      style: {
        position: 'absolute',
        right: '0',
        top: '0',
        width: '40%',
        height: '100%',
      },
      disable: !Artplayer.utils.isMobile,
      click: bindToggleControlsClick,
    },
    {
      name: 'backwardIcon',
      html: backwardIcon,
      style: {
        position: 'absolute',
        left: '25%',
        top: '50%',
        transform: 'translate(50%,-50%)',
        opacity: '0',
        transition: 'opacity 0.5s ease-in-out',
      },
      disable: !Artplayer.utils.isMobile,
    },
    {
      name: 'forwardIcon',
      html: forwardIcon,
      style: {
        position: 'absolute',
        right: '25%',
        top: '50%',
        transform: 'translate(50%, -50%)',
        opacity: '0',
        transition: 'opacity 0.5s ease-in-out',
      },
      disable: !Artplayer.utils.isMobile,
    },
  ];
}
