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
  it('labels playback as Ukrainian dub', () => {
    expect(episodePlayableLangBadges({ hasSub: true, hasDub: false })).toEqual(['dub']);
    expect(formatEpisodeLangLine({ hasSub: true, hasDub: false })).toBe('Dub');
    expect(seriesCatalogLangBadges({ has_sub: 12, has_dub: 0 })).toEqual(['dub']);
    expect(getStreamAvailabilityLabel({ has_sub: 12, has_dub: 4 })).toBe('Dub');
    expect(watchDocumentTitleI18nKey()).toBe('watch.documentTitleUkrainian');
  });

  it('shows Ukrainian audio copy', () => {
    const t = (key: string) => key;
    expect(buildWatchAvailabilityLines(t, { has_dub: 1, has_sub: 1 })).toEqual({
      audio: 'watch.audioUkrainian',
      subtitles: 'watch.subtitlesNone',
    });
  });
});
