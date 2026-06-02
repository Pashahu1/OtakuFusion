import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import { clearAnilibertyPlaybackQualityHint } from '@/shared/utils/anilibertyPlaybackQualityHint';
import { STORAGE_SERVER_NAME } from '@/shared/data/servers';

export const WATCH_RESOLVE_AUTO_RETRY_DELAY_SEC = 3;

export const WATCH_RESOLVE_AUTO_RETRY_REFRESHING_MSG = 'Refreshing stream…';

export function formatAutoRetryCountdownMessage(secondsLeft: number): string {
  const unit = secondsLeft === 1 ? 'second' : 'seconds';
  return `Couldn't start playback. Retrying in ${secondsLeft} ${unit}…`;
}

export function delayMs(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort);
  });
}

export function clearStoredServerHint(
  provider: WatchStreamProvider,
  localAnimeId?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    if (provider === 'aniliberty') {
      clearAnilibertyPlaybackQualityHint();
      return;
    }
    localStorage.removeItem(STORAGE_SERVER_NAME);
  } catch {

  }
}

export function shouldAutoRetryWatchResolve(err: unknown): boolean {
  if (err instanceof Error && err.name === 'AbortError') return false;
  if (!(err instanceof Error)) return true;
  const key = err.message.trim().toLowerCase();
  if (key === 'invalid episode number.') return false;
  if (key.includes('lang must')) return false;
  if (key.includes('episode is required')) return false;
  if (key.includes('no_working_source')) return false;
  if (key.includes('sources_empty')) return false;
  if (key.includes('episode_not_found')) return false;
  if (key.includes('watch_resolve_failed_404')) return false;
  return true;
}

export interface RunWatchResolveAutoRetryParams {
  signal: AbortSignal;
  providerJustChanged: boolean;
  watchStreamProvider: WatchStreamProvider;
  localAnimeId: string;
  setStreamLoadingMessage: (message: string | null) => void;
  runResolveAttempt: () => Promise<void>;
}

/** Countdown, clear server hint, and re-run resolve after a transient failure. */
export async function runWatchResolveAutoRetry(
  params: RunWatchResolveAutoRetryParams
): Promise<void> {
  const {
    signal,
    providerJustChanged,
    watchStreamProvider,
    localAnimeId,
    setStreamLoadingMessage,
    runResolveAttempt,
  } = params;

  if (providerJustChanged) {
    clearStoredServerHint(watchStreamProvider, localAnimeId);
    await runResolveAttempt();
    return;
  }

  for (let sec = WATCH_RESOLVE_AUTO_RETRY_DELAY_SEC; sec >= 1; sec--) {
    if (signal.aborted) return;
    setStreamLoadingMessage(formatAutoRetryCountdownMessage(sec));
    await delayMs(1000, signal);
  }

  setStreamLoadingMessage(WATCH_RESOLVE_AUTO_RETRY_REFRESHING_MSG);
  clearStoredServerHint(watchStreamProvider, localAnimeId);
  await runResolveAttempt();
  setStreamLoadingMessage(null);
}
