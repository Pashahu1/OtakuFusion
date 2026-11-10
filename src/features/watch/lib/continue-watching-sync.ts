import {
  fetchContinueWatching,
  deleteContinueWatchingEntry,
  replaceContinueWatchingList,
  upsertContinueWatchingEntry,
} from '@/lib/api/continue-watching';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';
import {
  mergeContinueWatchingLists,
  readContinueWatchingList,
  writeContinueWatchingList,
} from './continue-watching-list';

const SERVER_UPSERT_DEBOUNCE_MS = 2500;

let pendingUpsert: ContinueWatchingEntry | null = null;
let upsertTimer: ReturnType<typeof setTimeout> | null = null;
let hydrateInFlight: Promise<void> | null = null;

function clearUpsertTimer(): void {
  if (!upsertTimer) return;
  clearTimeout(upsertTimer);
  upsertTimer = null;
}

async function flushPendingUpsert(): Promise<void> {
  const entry = pendingUpsert;
  pendingUpsert = null;
  clearUpsertTimer();
  if (!entry) return;
  try {
    await upsertContinueWatchingEntry(entry);
  } catch {
    /* guest or offline — local cache already has the progress */
  }
}

export function scheduleContinueWatchingServerUpsert(
  entry: ContinueWatchingEntry,
): void {
  if (typeof window === 'undefined') return;
  pendingUpsert = entry;
  clearUpsertTimer();
  upsertTimer = setTimeout(() => {
    void flushPendingUpsert();
  }, SERVER_UPSERT_DEBOUNCE_MS);
}

export function scheduleContinueWatchingServerDelete(animeId: string): void {
  if (typeof window === 'undefined') return;
  if (pendingUpsert && pendingUpsert.id === animeId) {
    pendingUpsert = null;
    clearUpsertTimer();
  }
  void deleteContinueWatchingEntry(animeId);
}

export async function hydrateContinueWatchingFromServer(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (hydrateInFlight) return hydrateInFlight;

  hydrateInFlight = (async () => {
    const remote = await fetchContinueWatching();
    if (remote === null) return;

    const local = readContinueWatchingList();
    const merged = mergeContinueWatchingLists(local, remote);
    writeContinueWatchingList(merged);

    const remoteKeys = remote
      .map((entry) => `${entry.id}:${entry.updatedAt ?? 0}:${entry.episodeId}`)
      .sort()
      .join('|');
    const mergedKeys = merged
      .map((entry) => `${entry.id}:${entry.updatedAt ?? 0}:${entry.episodeId}`)
      .sort()
      .join('|');

    if (mergedKeys !== remoteKeys) {
      await replaceContinueWatchingList(merged);
    }
  })().finally(() => {
    hydrateInFlight = null;
  });

  return hydrateInFlight;
}

export function bindContinueWatchingSyncLifecycle(): void {
  if (typeof window === 'undefined') return;
  const flush = () => {
    void flushPendingUpsert();
  };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
