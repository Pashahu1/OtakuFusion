export { isHardHttpFailure } from './playback-preferences/httpFailure';
export {
  getApproxDisplayShortSidePx,
  getBestLevelIndexForDisplay,
  getPreferred720LevelIndex,
  getPreferred1080LevelIndex,
  getHighestAvailableLevelIndex,
  getNextLowerLevelIndex,
} from './playback-preferences/hlsQualityLevels';
export {
  DEFAULT_HLS_QUALITY_HEIGHT,
  readHlsQualityPreference,
  writeHlsQualityPreference,
  resolveLevelIndexForStoredQuality,
  type HlsQualityPreference,
} from './playback-preferences/hlsQualityStorage';
export {
  attachHlsQualityPreferencePersistence,
  type AttachHlsQualityPersistOptions,
} from './playback-preferences/hlsQualityPersistence';
export { tryDowngradeHlsQualityLevel } from './playback-preferences/hlsQualityFallback';
export {
  readSubtitlePreference,
  writeSubtitlePreference,
} from './playback-preferences/subtitlePreferences';
