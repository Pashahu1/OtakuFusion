import { describe, expect, it } from 'vitest';

import {
  cleanEpisodeTitle,
  formatEpisodeCardTitle,
} from './format-episode-card-title';

describe('formatEpisodeCardTitle', () => {
  it('keeps a distinct episode name', () => {
    expect(
      formatEpisodeCardTitle('ONE PIECE', 1, "I'm Luffy! The Man Who's Gonna Be King of the Pirates!"),
    ).toBe("E1 — I'm Luffy! The Man Who's Gonna Be King of the Pirates!");
  });

  it('drops a repeated series name and Episode N', () => {
    expect(
      formatEpisodeCardTitle(
        'Black Clover Season 2',
        1,
        'Black Clover Season 2 – Episode 1',
      ),
    ).toBe('E1');
    expect(
      cleanEpisodeTitle('ONE PIECE', 8, 'ONE PIECE - Episode 8'),
    ).toBe('');
  });

  it('falls back to the episode label when there is no title', () => {
    expect(formatEpisodeCardTitle('Naruto', 12, '')).toBe('E12');
  });
});
