import { ANIKOTO_PLAYBACK_ENABLED } from '@/features/watch/lib/watch-provider';

export interface EpisodeLangFlags {
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface CatalogTvLangCounts {
  has_sub?: number;
  has_dub?: number;
}

export type WatchLangBadge = 'dub' | 'sub';

/** Hikka is Ukrainian dub. JP/EN stay out of the player until Anikoto is live. */
export function isUkrainianDubOnlyPlayback(): boolean {
  return !ANIKOTO_PLAYBACK_ENABLED;
}

export function episodePlayableLangBadges(
  item: EpisodeLangFlags,
  ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): WatchLangBadge[] {
  if (ukrainianDubOnly) return ['dub'];

  const badges: WatchLangBadge[] = [];
  if (item.hasDub) badges.push('dub');
  if (item.hasSub !== false) badges.push('sub');
  if (!badges.length) badges.push('sub');
  return badges;
}

export function formatEpisodeLangLine(
  item: EpisodeLangFlags,
  ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): string {
  return episodePlayableLangBadges(item, ukrainianDubOnly)
    .map((badge) => (badge === 'dub' ? 'Dub' : 'Sub'))
    .join(' | ');
}

export function seriesCatalogLangBadges(
  tv: CatalogTvLangCounts | undefined,
  ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): WatchLangBadge[] {
  if (ukrainianDubOnly) return ['dub'];

  const hasSub = (tv?.has_sub ?? 0) > 0;
  const hasDub = (tv?.has_dub ?? 0) > 0;
  if (hasSub && hasDub) return ['sub', 'dub'];
  if (hasDub) return ['dub'];
  return ['sub'];
}

/** Card footer: what the user can actually play today. */
export function getStreamAvailabilityLabel(
  tv: CatalogTvLangCounts | undefined,
  ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): string | null {
  if (ukrainianDubOnly) return 'Dub';
  if (!tv) return null;
  const hasSub = (tv.has_sub ?? 0) > 0;
  const hasDub = (tv.has_dub ?? 0) > 0;
  if (hasSub && hasDub) return 'Sub | Dub';
  if (hasSub) return 'Sub';
  if (hasDub) return 'Dub';
  return null;
}

export function watchDocumentTitleI18nKey(
  ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): 'watch.documentTitleUkrainian' | 'watch.documentTitleSubDub' {
  return ukrainianDubOnly
    ? 'watch.documentTitleUkrainian'
    : 'watch.documentTitleSubDub';
}

export function buildWatchAvailabilityLines(
  t: (key: string) => string,
  tv?: CatalogTvLangCounts,
  ukrainianDubOnly: boolean = isUkrainianDubOnlyPlayback(),
): { audio: string; subtitles: string } {
  if (ukrainianDubOnly) {
    return {
      audio: t('watch.audioUkrainian'),
      subtitles: t('watch.subtitlesNone'),
    };
  }

  const hasDub = (tv?.has_dub ?? 0) > 0;
  const hasSub = (tv?.has_sub ?? 0) > 0;
  return {
    audio: hasDub
      ? `${t('watch.audioJapanese')}, ${t('watch.audioEnglish')}`
      : t('watch.audioJapanese'),
    subtitles: hasSub ? t('watch.hardsub') : t('watch.hardsubAlt'),
  };
}
