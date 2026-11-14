export interface EpisodeLangFlags {
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface CatalogTvLangCounts {
  has_sub?: number;
  has_dub?: number;
}

export type WatchLangBadge = 'dub' | 'sub';

export interface WatchPlaybackLanguages {
  ukrainian: boolean;
  japanese: boolean;
  english: boolean;
}

export function formatPlaybackLanguageLine(
  languages: WatchPlaybackLanguages,
  t: (key: string) => string,
): string {
  const labels: string[] = [];
  if (languages.ukrainian) labels.push(t('watch.audioUkrainian'));
  if (languages.japanese) labels.push(t('watch.audioJapanese'));
  if (languages.english) labels.push(t('watch.audioEnglish'));
  return labels.join(' · ');
}

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
  languages: WatchPlaybackLanguages,
  t: (key: string) => string,
): string {
  return formatPlaybackLanguageLine(languages, t);
}

export function seriesCatalogLangBadges(
  _tv?: CatalogTvLangCounts,
  _ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): WatchLangBadge[] {
  return ['dub'];
}

/**
 * Home cards have no per-title audio match, so they do not claim a dub.
 * The card falls back to format, episode count, and duration.
 */
export function getStreamAvailabilityLabel(
  _tv?: CatalogTvLangCounts,
  _ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): string | null {
  return null;
}

export function watchDocumentTitleI18nKey(
  _ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): 'watch.documentTitleUkrainian' | 'watch.documentTitleSubDub' {
  return 'watch.documentTitleSubDub';
}

export function buildWatchAvailabilityLines(
  t: (key: string) => string,
  languages: WatchPlaybackLanguages,
  pending = false,
): { audio: string; subtitles: string } {
  const audio = formatPlaybackLanguageLine(languages, t);
  if (!audio && pending) return { audio: '', subtitles: '' };
  if (languages.japanese || languages.english) {
    return { audio, subtitles: t('watch.hardsub') };
  }
  if (languages.ukrainian) {
    return { audio, subtitles: t('watch.subtitlesNone') };
  }
  return { audio: t('watch.unavailable'), subtitles: t('watch.unavailable') };
}
