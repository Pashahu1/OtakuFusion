import { describe, expect, it } from 'vitest';

import {
  pickAnikotoPlaybackAttempt,
  resolveAnikotoEnglishAvailability,
} from './pickAnikotoPlayback';
import type { AnikotoMappedStream } from './anikotoTypes';

function stream(url: string): AnikotoMappedStream {
  return { url, referer: 'https://megaplay.buzz/', tracks: [], intro: null, outro: null };
}

describe('pickAnikotoPlaybackAttempt', () => {
  it('uses the first Japanese playlist', () => {
    const picked = pickAnikotoPlaybackAttempt(
      [
        { server: 'hd-1', sub: null, dub: stream('https://cdn.example/dub.m3u8') },
        { server: 'hd-2', sub: stream('https://cdn.example/sub.m3u8'), dub: null },
      ],
      'sub',
    );
    expect(picked?.server).toBe('hd-2');
    expect(picked?.mapped.url).toBe('https://cdn.example/sub.m3u8');
  });

  it('skips an English playlist that is the same file as Japanese', () => {
    const picked = pickAnikotoPlaybackAttempt(
      [
        {
          server: 'hd-1',
          sub: stream('https://cdn.example/same.m3u8'),
          dub: stream('https://cdn.example/same.m3u8'),
        },
        {
          server: 'hd-2',
          sub: stream('https://cdn.example/sub.m3u8'),
          dub: stream('https://cdn.example/dub.m3u8'),
        },
      ],
      'dub',
    );
    expect(picked?.server).toBe('hd-2');
    expect(picked?.mapped.url).toBe('https://cdn.example/dub.m3u8');
  });
});

describe('resolveAnikotoEnglishAvailability', () => {
  it('keeps English when the playlist comparison did not run', () => {
    expect(resolveAnikotoEnglishAvailability(true, null)).toBe(true);
  });

  it('hides English when the dub file is the Japanese playlist', () => {
    expect(resolveAnikotoEnglishAvailability(true, false)).toBe(false);
  });
});
