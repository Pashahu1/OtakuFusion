import { describe, expect, it } from 'vitest';

import { resolveStartupPlaybackAudio } from './playback-audio';

describe('resolveStartupPlaybackAudio', () => {
  it('keeps Japanese once Anikoto confirms the track', () => {
    expect(
      resolveStartupPlaybackAudio({
        selected: 'ja',
        matchStatus: 'ready',
        hasJapanese: true,
        hasEnglish: true,
        hikkaEligible: true,
      }),
    ).toBe('ja');
  });

  it('falls back to Ukrainian when Japanese audio is missing', () => {
    expect(
      resolveStartupPlaybackAudio({
        selected: 'ja',
        matchStatus: 'ready',
        hasJapanese: false,
        hasEnglish: true,
        hikkaEligible: true,
      }),
    ).toBe('uk');
  });

  it('does not replace an explicit English choice', () => {
    expect(
      resolveStartupPlaybackAudio({
        selected: 'en',
        matchStatus: 'ready',
        hasJapanese: true,
        hasEnglish: true,
        hikkaEligible: true,
      }),
    ).toBe('en');
  });
});
