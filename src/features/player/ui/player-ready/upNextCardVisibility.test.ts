import { describe, expect, it } from 'vitest';

import { shouldShowUpNextCard } from './upNextCardVisibility';

describe('shouldShowUpNextCard', () => {
  it('opens on hover even before the credits window', () => {
    expect(shouldShowUpNextCard(true, false, true)).toBe(true);
  });

  it('stays open when pinned near the end', () => {
    expect(shouldShowUpNextCard(true, true, false)).toBe(true);
  });

  it('stays closed without a next episode', () => {
    expect(shouldShowUpNextCard(false, true, true)).toBe(false);
  });
});
