import { describe, expect, it } from 'vitest';

import {
  buildWatchAvailabilityLines,
  episodePlayableLangBadges,
  formatEpisodeLangLine,
  getStreamAvailabilityLabel,
  seriesCatalogLangBadges,
  watchDocumentTitleI18nKey,
} from './watch-availability';

describe('watch availability copy', () => {
  it('labels Hikka-only playback as Ukrainian dub', () => {
    expect(episodePlayableLangBadges({ hasSub: true, hasDub: false }, true)).toEqual([
      'dub',
    ]);
    expect(formatEpisodeLangLine({ hasSub: true, hasDub: false }, true)).toBe('Dub');
    expect(seriesCatalogLangBadges({ has_sub: 12, has_dub: 0 }, true)).toEqual(['dub']);
  });

  it('uses catalog flags when Anikoto is live', () => {
    expect(episodePlayableLangBadges({ hasSub: true, hasDub: true }, false)).toEqual([
      'dub',
      'sub',
    ]);
    expect(formatEpisodeLangLine({ hasSub: true, hasDub: false }, false)).toBe('Sub');
    expect(seriesCatalogLangBadges({ has_sub: 12, has_dub: 4 }, false)).toEqual([
      'sub',
      'dub',
    ]);
  });

  it('shows Ukrainian audio while Hikka is the only live source', () => {
    const t = (key: string) => key;
    expect(buildWatchAvailabilityLines(t, { has_sub: 1 }, true)).toEqual({
      audio: 'watch.audioUkrainian',
      subtitles: 'watch.subtitlesNone',
    });
    expect(buildWatchAvailabilityLines(t, { has_dub: 1, has_sub: 1 }, false)).toEqual({
      audio: 'watch.audioJapanese, watch.audioEnglish',
      subtitles: 'watch.hardsub',
    });
  });

  it('picks an honest document title key', () => {
    expect(watchDocumentTitleI18nKey(true)).toBe('watch.documentTitleUkrainian');
    expect(watchDocumentTitleI18nKey(false)).toBe('watch.documentTitleSubDub');
  });

  it('labels catalog cards as Dub while Hikka is the only live source', () => {
    expect(getStreamAvailabilityLabel({ has_sub: 12, has_dub: 0 }, true)).toBe('Dub');
    expect(getStreamAvailabilityLabel(undefined, true)).toBe('Dub');
  });

  it('uses AniList counters on cards when Anikoto is live', () => {
    expect(getStreamAvailabilityLabel({ has_sub: 12, has_dub: 4 }, false)).toBe(
      'Sub | Dub',
    );
    expect(getStreamAvailabilityLabel({ has_sub: 12, has_dub: 0 }, false)).toBe('Sub');
    expect(getStreamAvailabilityLabel({ has_sub: 0, has_dub: 8 }, false)).toBe('Dub');
    expect(getStreamAvailabilityLabel(undefined, false)).toBeNull();
  });
});
