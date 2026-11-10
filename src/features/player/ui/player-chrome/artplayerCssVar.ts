import { PLAYER_THEME_COLOR } from '../playerConstants';

/** Artplayer CSS variables — Netflix-like density, brand accent. */
export const ARTPLAYER_NETFLIX_CSS_VAR = {
  '--art-theme': PLAYER_THEME_COLOR,
  '--art-progress-color': PLAYER_THEME_COLOR,
  '--art-progress-height': '4px',
  '--art-hover-color': '#ffffff',
  '--art-loaded-color': 'rgba(255, 255, 255, 0.42)',
  '--art-highlight-color': 'rgba(255, 255, 255, 0.55)',
  '--art-bottom-height': '92px',
  '--art-bottom-gap': '14px',
  '--art-control-height': '44px',
  '--art-control-icon-size': '24px',
  '--art-control-icon-scale': 1,
  '--art-indicator-size': '14px',
  '--art-indicator-scale': 1,
  '--art-volume-height': '96px',
  '--art-state-size': '88px',
  '--art-widget-background': 'rgba(18, 18, 18, 0.92)',
  '--art-tip-background': 'rgba(18, 18, 18, 0.92)',
} as const;
