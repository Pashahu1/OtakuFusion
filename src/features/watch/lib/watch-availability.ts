export interface EpisodeLangFlags {
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface CatalogTvLangCounts {
  has_sub?: number;
  has_dub?: number;
}

export type WatchLangBadge = 'dub' | 'sub';

/** Playback is Ukrainian dub only (Hikka). */
export function isUkrainianDubOnlyPlayback(): boolean {
  return true;
}

export function episodePlayableLangBadges(
  _item?: EpisodeLangFlags,
  _ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): WatchLangBadge[] {
  return ['dub'];
}

export function formatEpisodeLangLine(
  item?: EpisodeLangFlags,
  ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): string {
  return episodePlayableLangBadges(item, ukrainianDubOnly)
    .map((badge) => (badge === 'dub' ? 'Dub' : 'Sub'))
    .join(' | ');
}

export function seriesCatalogLangBadges(
  _tv?: CatalogTvLangCounts,
  _ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): WatchLangBadge[] {
  return ['dub'];
}

/** Card footer: what the user can actually play today. */
export function getStreamAvailabilityLabel(
  _tv?: CatalogTvLangCounts,
  _ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): string | null {
  return 'Dub';
}

export function watchDocumentTitleI18nKey(
  _ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): 'watch.documentTitleUkrainian' | 'watch.documentTitleSubDub' {
  return 'watch.documentTitleUkrainian';
}

export function buildWatchAvailabilityLines(
  t: (key: string) => string,
  _tv?: CatalogTvLangCounts,
  _ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): { audio: string; subtitles: string } {
  return {
    audio: t('watch.audioUkrainian'),
    subtitles: t('watch.subtitlesNone'),
  };
}
