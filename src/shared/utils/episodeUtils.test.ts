import { describe, expect, it } from 'vitest';
import { episodeMatchesSelection, getEpisodeNumberFromId } from '@/shared/utils/episodeUtils';

describe('getEpisodeNumberFromId', () => {
  it('extracts episode number from Anicore-style ?ep=N', () => {
    expect(getEpisodeNumberFromId('catalog-1?ep=12')).toBe('12');
    expect(getEpisodeNumberFromId('x?ep=3.5')).toBe('3.5');
  });

  it('accepts plain numeric id (Hikka)', () => {
    expect(getEpisodeNumberFromId('7')).toBe('7');
    expect(getEpisodeNumberFromId('10.5')).toBe('10.5');
  });

  it('returns undefined for invalid id', () => {
    expect(getEpisodeNumberFromId(undefined)).toBeUndefined();
    expect(getEpisodeNumberFromId('slug-without-ep')).toBeUndefined();
  });
});

describe('episodeMatchesSelection', () => {
  const ep = { id: 'release?ep=5', episode_no: 5 };

  it('returns false for empty selection', () => {
    expect(episodeMatchesSelection(ep, null)).toBe(false);
    expect(episodeMatchesSelection(ep, '')).toBe(false);
    expect(episodeMatchesSelection(ep, undefined)).toBe(false);
  });

  it('matches by ?ep= in id', () => {
    expect(episodeMatchesSelection(ep, '5')).toBe(true);
    expect(episodeMatchesSelection(ep, '6')).toBe(false);
  });

  it('matches by episode_no when id has no ep=', () => {
    const hikka = { id: '42', episode_no: 42 };
    expect(episodeMatchesSelection(hikka, '42')).toBe(true);
    expect(episodeMatchesSelection(hikka, '41')).toBe(false);
  });

  it('falls back to episode_no when selected does not match ?ep=', () => {
    const mixed = { id: 'x?ep=3', episode_no: 99 };
    expect(episodeMatchesSelection(mixed, '3')).toBe(true);
    expect(episodeMatchesSelection(mixed, '99')).toBe(true);
    expect(episodeMatchesSelection(mixed, '1')).toBe(false);
  });
});
