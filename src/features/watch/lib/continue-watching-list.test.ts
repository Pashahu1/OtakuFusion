import { describe, expect, it } from 'vitest';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
import { mergeContinueWatchingLists, parseContinueWatchingList } from './continue-watching-list';

function entry(
  partial: Partial<ContinueWatchingEntry> & Pick<ContinueWatchingEntry, 'id'>,
): ContinueWatchingEntry {
  return {
    data_id: Number(partial.id) || 1,
    episodeId: '1',
    updatedAt: 0,
    ...partial,
  };
}

describe('mergeContinueWatchingLists', () => {
  it('keeps the newer progress when the same title exists on both sides', () => {
    const local = [entry({ id: '10', episodeId: '2', updatedAt: 200, positionSeconds: 40 })];
    const remote = [entry({ id: '10', episodeId: '1', updatedAt: 100, positionSeconds: 10 })];

    expect(mergeContinueWatchingLists(local, remote)).toEqual([
      expect.objectContaining({ id: '10', episodeId: '2', positionSeconds: 40 }),
    ]);
  });

  it('keeps the saved playback audio', () => {
    const raw = JSON.stringify([
      entry({ id: '101922', episodeId: '1', updatedAt: 5, playbackAudio: 'uk' }),
    ]);
    expect(parseContinueWatchingList(raw)[0]?.playbackAudio).toBe('uk');
  });

  it('unions different titles and sorts by recency', () => {
    const local = [entry({ id: '1', updatedAt: 10 })];
    const remote = [entry({ id: '2', updatedAt: 30 })];

    expect(mergeContinueWatchingLists(local, remote).map((item) => item.id)).toEqual([
      '2',
      '1',
    ]);
  });
});
