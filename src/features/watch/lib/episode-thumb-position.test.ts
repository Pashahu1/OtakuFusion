import { describe, expect, it } from 'vitest';

import { episodeThumbObjectPosition } from './episode-thumb-position';

describe('episodeThumbObjectPosition', () => {
  it('varies crop origin by episode number', () => {
    expect(episodeThumbObjectPosition(1)).not.toBe(episodeThumbObjectPosition(8));
  });
});
