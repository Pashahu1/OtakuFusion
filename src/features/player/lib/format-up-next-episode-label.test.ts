import { describe, expect, it } from 'vitest';

import { formatUpNextCard } from './format-up-next-episode-label';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

function episode(partial: Partial<EpisodesTypes>): EpisodesTypes {
  return {
    episode_no: 10,
    id: '10',
    data_id: 10,
    jname: '',
    title: 'Those Who Protect',
    japanese_title: '',
    ...partial,
  };
}

describe('formatUpNextCard', () => {
  it('formats a Netflix-style title line', () => {
    expect(formatUpNextCard(episode({}))).toEqual({
      heading: 'Next Episode',
      title: 'E10 — Those Who Protect',
      subtitle: '',
    });
  });

  it('keeps a distinct japanese name as subtitle', () => {
    expect(formatUpNextCard(episode({ jname: '守る者たち' })).subtitle).toBe('守る者たち');
  });
});
