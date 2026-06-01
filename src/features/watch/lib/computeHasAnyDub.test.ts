import { describe, expect, it } from 'vitest';
import { computeHasAnyDub } from './computeHasAnyDub';

describe('computeHasAnyDub', () => {
  it('returns true when TV metadata has dub', () => {
    expect(
      computeHasAnyDub({
        dubFromTv: 1,
        episodes: null,
      })
    ).toBe(true);
  });

  it('returns false when all episodes explicitly lack dub', () => {
    expect(
      computeHasAnyDub({
        dubFromTv: 0,
        episodes: [{ hasDub: false } as never, { hasDub: false } as never],
      })
    ).toBe(false);
  });

  it('returns true when any episode has dub', () => {
    expect(
      computeHasAnyDub({
        dubFromTv: 0,
        episodes: [{ hasDub: false } as never, { hasDub: true } as never],
      })
    ).toBe(true);
  });

  it('returns false when dub status is unknown', () => {
    expect(
      computeHasAnyDub({
        dubFromTv: 0,
        episodes: [{ hasDub: undefined } as never],
      })
    ).toBe(false);
  });
});
