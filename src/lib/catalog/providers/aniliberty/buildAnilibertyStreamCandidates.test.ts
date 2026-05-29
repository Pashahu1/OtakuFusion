import { describe, expect, it } from 'vitest';
import {
  ANILIBRIA_STREAM_HEADERS,
  buildAnilibertyStreamCandidatesFromEpisodeRow,
} from '@/lib/catalog/providers/aniliberty/buildAnilibertyStreamCandidates';
import type { CrysolineAnilibertyEpisodeRow } from '@/server/crysoline/anilibertyClient';

const HLS_1080 = 'https://cdn.example.com/1080/playlist.m3u8';
const HLS_720 = 'https://cdn.example.com/720/stream.m3u8';
const HLS_480 = 'https://cdn.example.com/hls/480/index.m3u8';
const NOT_HLS = 'https://cdn.example.com/video.mp4';

describe('buildAnilibertyStreamCandidatesFromEpisodeRow', () => {
  it('returns empty array without metadata', () => {
    expect(buildAnilibertyStreamCandidatesFromEpisodeRow(null)).toEqual([]);
    expect(buildAnilibertyStreamCandidatesFromEpisodeRow({ id: 'e1', number: 1 })).toEqual([]);
  });

  it('builds HLS candidates from all tiers and sorts by resolution (1080 → 720 → 480)', () => {
    const row: CrysolineAnilibertyEpisodeRow = {
      id: 'ep-uuid',
      number: 1,
      metadata: {
        hls_1080: HLS_1080,
        hls_720: HLS_720,
        hls_480: HLS_480,
      },
    };

    const candidates = buildAnilibertyStreamCandidatesFromEpisodeRow(row);

    expect(candidates).toHaveLength(3);
    expect(candidates.map((c) => c.server)).toEqual([
      '1080p · Anilibria',
      '720p · Anilibria',
      '480p · Anilibria',
    ]);
    expect(candidates[0].link).toEqual({ file: HLS_1080, type: 'hls' });
    expect(candidates[0].request_headers).toEqual(ANILIBRIA_STREAM_HEADERS);
    expect(candidates.every((c) => c.type === 'sub' && c.tracks.length === 0)).toBe(true);
  });

  it('skips empty and non-HLS URLs', () => {
    const row: CrysolineAnilibertyEpisodeRow = {
      id: 'ep-2',
      number: 2,
      metadata: {
        hls_1080: '   ',
        hls_720: NOT_HLS,
        hls_480: HLS_480,
      },
    };

    const candidates = buildAnilibertyStreamCandidatesFromEpisodeRow(row);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].server).toBe('480p · Anilibria');
  });

  it('assigns sequential ids', () => {
    const row: CrysolineAnilibertyEpisodeRow = {
      id: 'ep-3',
      number: 3,
      metadata: { hls_720: HLS_720, hls_480: HLS_480 },
    };

    const candidates = buildAnilibertyStreamCandidatesFromEpisodeRow(row);

    expect(candidates.map((c) => c.id)).toEqual([1, 2]);
  });
});
