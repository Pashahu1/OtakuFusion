import { describe, expect, it } from 'vitest';

import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import {
  findNextWatchEpisode,
  findPrevWatchEpisode,
} from './watch-play-episode-utils';

const episodes: EpisodesTypes[] = [
  {
    episode_no: 1,
    id: '1',
    data_id: 1,
    jname: '',
    title: 'One',
    japanese_title: '',
  },
  {
    episode_no: 2,
    id: '2',
    data_id: 2,
    jname: '',
    title: 'Two',
    japanese_title: '',
  },
];

describe('watch-play-episode-utils', () => {
  it('finds next and previous episodes by episode number', () => {
    expect(findNextWatchEpisode(episodes, episodes[0]!)?.episode_no).toBe(2);
    expect(findPrevWatchEpisode(episodes, episodes[1]!)?.episode_no).toBe(1);
    expect(findPrevWatchEpisode(episodes, episodes[0]!)).toBeNull();
    expect(findNextWatchEpisode(episodes, episodes[1]!)).toBeNull();
  });
});
