import { describe, expect, it } from 'vitest';

import {
  buildWatchAvailabilityLines,
  episodePlayableLangBadges,
  formatEpisodeLangLine,
  formatPlaybackLanguageLine,
  getStreamAvailabilityLabel,
  seriesCatalogLangBadges,
  watchDocumentTitleI18nKey,
} from './watch-availability';

const t = (key: string) => key;

describe('watch availability copy', () => {
  it('keeps the catalog card badge', () => {
    expect(episodePlayableLangBadges({ hasSub: true, hasDub: false })).toEqual(['dub']);
    expect(seriesCatalogLangBadges({ has_sub: 12, has_dub: 0 })).toEqual(['dub']);
    expect(getStreamAvailabilityLabel({ has_sub: 12, has_dub: 4 })).toBe('Dub');
    expect(watchDocumentTitleI18nKey()).toBe('watch.documentTitleSubDub');
  });

  it('lists only the audio languages that exist', () => {
    expect(
      formatPlaybackLanguageLine(
        { ukrainian: false, japanese: true, english: false },
        t,
      ),
    ).toBe('watch.audioJapanese');
    expect(
      formatEpisodeLangLine(
        { ukrainian: true, japanese: true, english: true },
        t,
      ),
    ).toBe('watch.audioUkrainian · watch.audioJapanese · watch.audioEnglish');
  });

  it('shows player subtitles when Japanese or English audio exists', () => {
    expect(
      buildWatchAvailabilityLines(t, {
        ukrainian: false,
        japanese: true,
        english: false,
      }),
    ).toEqual({
      audio: 'watch.audioJapanese',
      subtitles: 'watch.hardsub',
    });
  });

  it('keeps the Ukrainian-only subtitle note', () => {
    expect(
      buildWatchAvailabilityLines(t, {
        ukrainian: true,
        japanese: false,
        english: false,
      }),
    ).toEqual({
      audio: 'watch.audioUkrainian',
      subtitles: 'watch.subtitlesNone',
    });
  });

  it('stays blank while availability is still loading', () => {
    expect(
      buildWatchAvailabilityLines(
        t,
        { ukrainian: false, japanese: false, english: false },
        true,
      ),
    ).toEqual({ audio: '', subtitles: '' });
  });
});
