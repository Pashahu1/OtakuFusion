import { describe, expect, it } from 'vitest';

import {
  looksLikeHlsSegmentUrl,
  looksLikePassthroughMediaUrl,
  looksLikeWebVttUrl,
} from '@/server/m3u8-proxy/segmentDetect';

describe('segmentDetect', () => {
  it('detects disguised Anikoto HLS segments', () => {
    const url =
      'https://uj9e5.sugevideo.xyz/anime/abc/seg-1-f2-v1-a1.jpg';
    expect(looksLikeHlsSegmentUrl(url)).toBe(true);
    expect(looksLikePassthroughMediaUrl(url)).toBe(true);
  });

  it('detects standard ts segments', () => {
    expect(looksLikeHlsSegmentUrl('https://cdn.example/seg001.ts')).toBe(true);
  });

  it('ignores unrelated jpg assets', () => {
    expect(looksLikeHlsSegmentUrl('https://cdn.example/poster.jpg')).toBe(false);
  });

  it('detects webvtt subtitles', () => {
    const url =
      'https://fxpy7.watching.onl/anime/abc/subtitles/eng-2.vtt';
    expect(looksLikeWebVttUrl(url)).toBe(true);
    expect(looksLikePassthroughMediaUrl(url)).toBe(true);
  });
});
