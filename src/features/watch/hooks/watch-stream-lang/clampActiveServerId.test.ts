import { describe, expect, it } from 'vitest';
import {
  WATCH_SERVER_DUB_ID,
  WATCH_SERVER_SUB_ID,
} from '@/shared/data/servers';
import { clampActiveServerId } from './clampActiveServerId';

describe('clampActiveServerId', () => {
  it('keeps dub when the user chose dub', () => {
    expect(
      clampActiveServerId(WATCH_SERVER_DUB_ID, true, 'hikka', false, false),
    ).toBe(WATCH_SERVER_DUB_ID);
  });

  it('clamps dub to sub for Hikka when the user did not choose dub', () => {
    expect(
      clampActiveServerId(WATCH_SERVER_DUB_ID, false, 'hikka', true, true),
    ).toBe(WATCH_SERVER_SUB_ID);
  });

  it('keeps sub id', () => {
    expect(
      clampActiveServerId(WATCH_SERVER_SUB_ID, false, 'hikka', true, true),
    ).toBe(WATCH_SERVER_SUB_ID);
  });
});
