import Artplayer from 'artplayer';

import { backwardIcon, forwardIcon } from '../PlayerIcons';

import { bindPlayPauseLayerClick, bindToggleControlsClick } from './playPauseClick';

/** Artplayer bottom bar (progress + controls) — touch layers must not cover it. */
const MOBILE_CONTROLS_CLEARANCE = '54px';

function mobileVideoTouchZoneStyle(
  partial: Record<string, string>,
): Record<string, string> {
  return {
    position: 'absolute',
    top: '0',
    height: `calc(100% - ${MOBILE_CONTROLS_CLEARANCE})`,
    ...partial,
  };
}

export function createMobileInteractionLayers(userPausedRef: React.RefObject<boolean>) {
  const playPauseClick = bindPlayPauseLayerClick(userPausedRef);

  return [
    {
      html: '',
      style: mobileVideoTouchZoneStyle({
        left: '50%',
        width: '20%',
        transform: 'translateX(-50%)',
      }),
      disable: !Artplayer.utils.isMobile,
      click: playPauseClick,
    },
    {
      name: 'rewind',
      html: '',
      style: mobileVideoTouchZoneStyle({
        left: '0',
        width: '40%',
      }),
      disable: !Artplayer.utils.isMobile,
      click: bindToggleControlsClick,
    },
    {
      name: 'forward',
      html: '',
      style: mobileVideoTouchZoneStyle({
        right: '0',
        width: '40%',
      }),
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
        pointerEvents: 'none',
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
        pointerEvents: 'none',
      },
      disable: !Artplayer.utils.isMobile,
    },
  ];
}
