import { describe, expect, it } from 'vitest';

import { anikotoDubPlaylistIsDistinct, mapAnikotoStreamPayload } from './mapAnikotoStream';

describe('mapAnikotoStreamPayload', () => {
  it('maps an HLS playlist, referer, captions, and skip spans', () => {
    const mapped = mapAnikotoStreamPayload({
      success: true,
      data: {
        m3u8: 'https://cdn.example/master.m3u8',
        referer: 'https://megaplay.buzz/',
        intro: { start: 0, end: 89 },
        outro: { start: 10, end: 10 },
        subtitles: [
          { file: 'https://subs.example/eng.vtt', label: 'English', kind: 'captions', default: true },
          { file: 'not-a-url', label: 'Broken' },
        ],
      },
    });

    expect(mapped).toEqual({
      url: 'https://cdn.example/master.m3u8',
      referer: 'https://megaplay.buzz/',
      intro: { start: 0, end: 89 },
      outro: null,
      tracks: [
        {
          file: 'https://subs.example/eng.vtt',
          label: 'English',
          kind: 'captions',
          default: true,
        },
      ],
    });
  });

  it('treats an identical dub playlist as Japanese audio', () => {
    expect(
      anikotoDubPlaylistIsDistinct(
        'https://cdn.example/same.m3u8',
        'https://cdn.example/same.m3u8',
      ),
    ).toBe(false);
    expect(
      anikotoDubPlaylistIsDistinct(
        'https://cdn.example/sub.m3u8',
        'https://cdn.example/dub.m3u8',
      ),
    ).toBe(true);
  });

  it('returns null when the playlist URL is missing', () => {
    expect(mapAnikotoStreamPayload({ success: true, data: {} })).toBeNull();
  });
});
