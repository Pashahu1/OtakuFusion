import { describe, expect, it } from 'vitest';

import {
  resolveWatchPlayerPhase,
  type ResolveWatchPlayerPhaseInput,
} from './resolveWatchPlayerPhase';

const overlayMessage = { title: 'Unavailable', subtitle: 'Try another server.' };

const base: ResolveWatchPlayerPhaseInput = {
  playerShellPending: false,
  buffering: false,
  streamUrl: null,
  showErrorBlock: false,
  hasBuiltinError: false,
  streamOverlayMessage: null,
};

describe('resolveWatchPlayerPhase', () => {
  it('returns loading while the player shell is pending', () => {
    expect(
      resolveWatchPlayerPhase({ ...base, playerShellPending: true }),
    ).toBe('loading');
  });

  it('returns loading while buffering without a stream url', () => {
    expect(
      resolveWatchPlayerPhase({ ...base, buffering: true }),
    ).toBe('loading');
  });

  it('returns playing when a stream url is ready', () => {
    expect(
      resolveWatchPlayerPhase({ ...base, streamUrl: 'https://example.com/stream.m3u8' }),
    ).toBe('playing');
  });

  it('returns error when resolve failed and showErrorBlock is set', () => {
    expect(
      resolveWatchPlayerPhase({ ...base, showErrorBlock: true }),
    ).toBe('error');
  });

  it('returns error when resolve failed and the built-in player reported an error', () => {
    expect(
      resolveWatchPlayerPhase({ ...base, hasBuiltinError: true }),
    ).toBe('error');
  });

  it('returns error when resolve failed and streamOverlayMessage is present', () => {
    expect(
      resolveWatchPlayerPhase({ ...base, streamOverlayMessage: overlayMessage }),
    ).toBe('error');
  });

  it('returns error when the built-in player dies even if a stream url is still set', () => {
    expect(
      resolveWatchPlayerPhase({
        ...base,
        hasBuiltinError: true,
        streamUrl: 'https://example.com/stream.m3u8',
      }),
    ).toBe('error');
  });
});
