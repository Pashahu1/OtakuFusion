'use client';

import { useCallback, useEffect, useRef } from 'react';
import type Artplayer from 'artplayer';

import type { ContinueWatchingProgress } from '../updateContinueWatching';

const PROGRESS_SAVE_INTERVAL_MS = 12_000;
const RESUME_END_BUFFER_SECONDS = 8;
const MIN_RESUME_SECONDS = 12;

export interface UseArtplayerPlaybackProgressParams {
  scheduleContinueWatchingUpdate: (progress?: ContinueWatchingProgress) => void;
  savedPositionSeconds?: number;
}

/**
 * Throttled progress persistence + one-shot resume seek after metadata.
 */
export function useArtplayerPlaybackProgress({
  scheduleContinueWatchingUpdate,
  savedPositionSeconds,
}: UseArtplayerPlaybackProgressParams) {
  const lastSaveAtRef = useRef(0);
  const resumeAppliedRef = useRef(false);
  const savedPositionRef = useRef(savedPositionSeconds);

  useEffect(() => {
    savedPositionRef.current = savedPositionSeconds;
    resumeAppliedRef.current = false;
  }, [savedPositionSeconds]);

  const attachPlaybackProgressHandlers = useCallback(
    (art: Artplayer) => {
      resumeAppliedRef.current = false;
      lastSaveAtRef.current = 0;

      const maybeResume = () => {
        if (resumeAppliedRef.current) return;
        const saved = savedPositionRef.current;
        const duration = art.duration;
        if (
          saved == null ||
          !Number.isFinite(saved) ||
          saved < MIN_RESUME_SECONDS ||
          !Number.isFinite(duration) ||
          duration <= 0 ||
          saved >= duration - RESUME_END_BUFFER_SECONDS
        ) {
          return;
        }
        resumeAppliedRef.current = true;
        art.currentTime = saved;
      };

      art.once('video:loadedmetadata', maybeResume);

      art.on('video:timeupdate', () => {
        const now = Date.now();
        if (now - lastSaveAtRef.current < PROGRESS_SAVE_INTERVAL_MS) return;
        const duration = art.duration;
        const current = art.currentTime;
        if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(current)) return;
        if (current < MIN_RESUME_SECONDS) return;
        if (current >= duration - RESUME_END_BUFFER_SECONDS) return;

        lastSaveAtRef.current = now;
        scheduleContinueWatchingUpdate({
          positionSeconds: Math.floor(current),
          durationSeconds: Math.floor(duration),
        });
      });
    },
    [scheduleContinueWatchingUpdate],
  );

  return { attachPlaybackProgressHandlers };
}
