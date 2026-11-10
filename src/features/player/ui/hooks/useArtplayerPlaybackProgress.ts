'use client';

import { useCallback, useEffect, useRef } from 'react';
import type Artplayer from 'artplayer';

import { episodePreviewCaptureAtSeconds } from '@/features/player/lib/episode-preview-capture';
import { saveEarlyEpisodePreviewIfMissing } from '@/features/player/lib/savePlaybackPreviewFrame';
import {
  consumePendingPlaybackResume,
  peekPendingPlaybackResume,
} from '@/features/watch/lib/playback-resume-pending';
import { normalizeEpisodeStorageKey } from '@/shared/utils/episodeUtils';
import type { ContinueWatchingProgress } from '../updateContinueWatching';
import type { ContinueWatchingPlaybackContext } from '../updateContinueWatching';

const PROGRESS_SAVE_INTERVAL_MS = 12_000;
const RESUME_END_BUFFER_SECONDS = 8;
const MIN_RESUME_SECONDS = 12;
const MIN_PENDING_RESUME_SECONDS = 2;
const PREVIEW_RETRY_WINDOW_SECONDS = 90;
const RESUME_DRIFT_TOLERANCE_SECONDS = 2;

export interface UseArtplayerPlaybackProgressParams {
  localAnimeId: string;
  episodeId: string | null | undefined;
  episodeNum?: number | null;
  scheduleContinueWatchingUpdate: (
    progress?: ContinueWatchingProgress,
    playback?: ContinueWatchingPlaybackContext,
  ) => void;
  savedPositionSeconds?: number;
  consumePendingOnResume?: boolean;
}

/**
 * Throttled progress persistence + resume seek with drift retry after language switch.
 * Captures one mid-episode JPEG into IndexedDB for the episode grid.
 */
export function useArtplayerPlaybackProgress({
  localAnimeId,
  episodeId,
  episodeNum,
  scheduleContinueWatchingUpdate,
  savedPositionSeconds,
  consumePendingOnResume = false,
}: UseArtplayerPlaybackProgressParams) {
  const lastSaveAtRef = useRef(0);
  const resumeAppliedRef = useRef(false);
  const resumeTargetRef = useRef<number | null>(null);
  const savedPositionRef = useRef(savedPositionSeconds);
  const localAnimeIdRef = useRef(localAnimeId);
  const episodeKeyRef = useRef(normalizeEpisodeStorageKey(episodeId, episodeNum));
  const earlyPreviewDoneRef = useRef(false);
  const earlyPreviewBusyRef = useRef(false);

  useEffect(() => {
    savedPositionRef.current = savedPositionSeconds;
    localAnimeIdRef.current = localAnimeId;
    episodeKeyRef.current = normalizeEpisodeStorageKey(episodeId, episodeNum);
  }, [savedPositionSeconds, localAnimeId, episodeId, episodeNum]);

  const attachPlaybackProgressHandlers = useCallback(
    (art: Artplayer) => {
      resumeAppliedRef.current = false;
      resumeTargetRef.current = null;
      lastSaveAtRef.current = 0;
      earlyPreviewDoneRef.current = false;
      earlyPreviewBusyRef.current = false;

      const readResumeTarget = (): number | null => {
        const saved = savedPositionRef.current;
        if (saved == null || !Number.isFinite(saved)) return null;

        const id = localAnimeIdRef.current?.trim();
        const ep = episodeKeyRef.current;
        const hasPending =
          Boolean(id && ep && peekPendingPlaybackResume(id, ep) != null);
        const minResume = hasPending ? MIN_PENDING_RESUME_SECONDS : MIN_RESUME_SECONDS;

        if (saved < minResume) return null;

        const duration = art.duration;
        if (Number.isFinite(duration) && duration > 0) {
          if (saved >= duration - RESUME_END_BUFFER_SECONDS) return null;
        }

        return saved;
      };

      const markResumeComplete = () => {
        if (resumeAppliedRef.current) return;
        resumeAppliedRef.current = true;
        resumeTargetRef.current = null;

        if (!consumePendingOnResume) return;
        const id = localAnimeIdRef.current?.trim();
        const ep = episodeKeyRef.current;
        if (id && ep) {
          consumePendingPlaybackResume(id, ep);
        }
      };

      const tryApplyResume = () => {
        if (resumeAppliedRef.current) return;

        const target = readResumeTarget();
        if (target == null) return;

        resumeTargetRef.current = target;
        if (Math.abs(art.currentTime - target) > 0.35) {
          art.currentTime = target;
        }
      };

      let lastResumeRetryAt = 0;

      const confirmOrRetryResume = () => {
        if (resumeAppliedRef.current) return;

        const target = resumeTargetRef.current ?? readResumeTarget();
        if (target == null) return;

        resumeTargetRef.current = target;
        const drift = Math.abs(art.currentTime - target);

        if (drift > RESUME_DRIFT_TOLERANCE_SECONDS) {
          const now = Date.now();
          if (now - lastResumeRetryAt < 400) return;
          lastResumeRetryAt = now;
          art.currentTime = target;
          return;
        }

        markResumeComplete();
      };

      art.on('video:loadedmetadata', tryApplyResume);
      art.on('video:loadeddata', tryApplyResume);
      art.on('video:canplay', tryApplyResume);
      art.on('video:seeked', confirmOrRetryResume);
      art.on('video:playing', () => {
        tryApplyResume();
        confirmOrRetryResume();
      });

      art.on('video:timeupdate', () => {
        confirmOrRetryResume();

        const id = localAnimeIdRef.current?.trim();
        const ep = episodeKeyRef.current;
        const video = art.video;
        const duration = art.duration;
        const current = art.currentTime;

        if (
          !earlyPreviewDoneRef.current &&
          !earlyPreviewBusyRef.current &&
          id &&
          ep &&
          Number.isFinite(duration) &&
          duration > 0 &&
          Number.isFinite(current)
        ) {
          const target = episodePreviewCaptureAtSeconds(ep, duration);
          if (current >= target) {
            earlyPreviewBusyRef.current = true;
            const allowDark = current >= target + PREVIEW_RETRY_WINDOW_SECONDS;
            void saveEarlyEpisodePreviewIfMissing(id, ep, video, { allowDark })
              .then((result) => {
                if (result !== 'skipped') earlyPreviewDoneRef.current = true;
              })
              .finally(() => {
                earlyPreviewBusyRef.current = false;
              });
          }
        }

        const now = Date.now();
        if (now - lastSaveAtRef.current < PROGRESS_SAVE_INTERVAL_MS) return;
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
    [scheduleContinueWatchingUpdate, consumePendingOnResume],
  );

  return { attachPlaybackProgressHandlers };
}
