import { describe, expect, it } from 'vitest';

import {
  EPISODE_UP_NEXT_BEFORE_END_SEC,
  EPISODE_WATCHED_BEFORE_END_SEC,
  getVideoRemainingSeconds,
  shouldMarkEpisodeWatched,
  shouldPromptUpNext,
  shouldShowCreditsSkipFallback,
  shouldSuppressOutroSkipForUpNext,
} from './episode-end-thresholds';

describe('episode-end-thresholds', () => {
  it('computes remaining seconds', () => {
    expect(getVideoRemainingSeconds(100, 500)).toBe(400);
    expect(getVideoRemainingSeconds(500, 500)).toBe(0);
    expect(getVideoRemainingSeconds(0, 0)).toBeNull();
  });

  it('marks watched ~3.5 min before end on normal episodes', () => {
    const duration = 1440;
    const threshold = duration - EPISODE_WATCHED_BEFORE_END_SEC;

    expect(shouldMarkEpisodeWatched(threshold - 1, duration)).toBe(false);
    expect(shouldMarkEpisodeWatched(threshold, duration)).toBe(true);
    expect(shouldMarkEpisodeWatched(duration - 1, duration)).toBe(true);
  });

  it('marks watched by progress on short episodes', () => {
    const duration = 300;

    expect(shouldMarkEpisodeWatched(200, duration)).toBe(false);
    expect(shouldMarkEpisodeWatched(255, duration)).toBe(true);
  });

  it('prompts up next ~3 min before end on normal episodes', () => {
    const duration = 1440;
    const threshold = duration - EPISODE_UP_NEXT_BEFORE_END_SEC;

    expect(shouldPromptUpNext(threshold - 1, duration)).toBe(false);
    expect(shouldPromptUpNext(threshold, duration)).toBe(true);
  });

  it('prompts up next by progress on short episodes', () => {
    const duration = 200;

    expect(shouldPromptUpNext(170, duration)).toBe(false);
    expect(shouldPromptUpNext(180, duration)).toBe(true);
  });

  it('shows credits skip fallback without outro markers', () => {
    const duration = 1440;
    const threshold = duration - EPISODE_UP_NEXT_BEFORE_END_SEC;

    expect(shouldShowCreditsSkipFallback(threshold - 1, duration, false)).toBe(false);
    expect(shouldShowCreditsSkipFallback(threshold, duration, false)).toBe(true);
    expect(shouldShowCreditsSkipFallback(duration - 1, duration, false)).toBe(false);
    expect(shouldShowCreditsSkipFallback(threshold, duration, true)).toBe(false);
  });

  it('suppresses Skip ED when up next should show and a successor exists', () => {
    const duration = 1440;
    const threshold = duration - EPISODE_UP_NEXT_BEFORE_END_SEC;

    expect(shouldSuppressOutroSkipForUpNext(threshold, duration, false)).toBe(false);
    expect(shouldSuppressOutroSkipForUpNext(threshold - 1, duration, true)).toBe(false);
    expect(shouldSuppressOutroSkipForUpNext(threshold, duration, true)).toBe(true);
  });
});
