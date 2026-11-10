import Artplayer from 'artplayer';

import { PLAYER_SKIP_SECONDS } from '../playerConstants';

import { bindPlayPauseLayerClick, bindToggleControlsClick } from './playPauseClick';

function seekFlashMarkup(direction: 'back' | 'forward'): string {
  const label = direction === 'back' ? `−${PLAYER_SKIP_SECONDS}` : `+${PLAYER_SKIP_SECONDS}`;
  return `<div class="of-seek-flash of-seek-flash--${direction}" aria-hidden="true"><span class="of-seek-flash__badge">${label}</span></div>`;
}

/** Artplayer bottom bar (progress + controls) — touch layers must not cover it. */
const MOBILE_CONTROLS_CLEARANCE =
  'calc(var(--art-bottom-height, 92px) + env(safe-area-inset-bottom, 0px))';

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
      html: seekFlashMarkup('back'),
      style: {
        position: 'absolute',
        left: '8%',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: '0',
        pointerEvents: 'none',
      },
      disable: !Artplayer.utils.isMobile,
    },
    {
      name: 'forwardIcon',
      html: seekFlashMarkup('forward'),
      style: {
        position: 'absolute',
        right: '8%',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: '0',
        pointerEvents: 'none',
      },
      disable: !Artplayer.utils.isMobile,
    },
  ];
}
