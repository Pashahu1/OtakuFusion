const DB_NAME = 'otakufusion-playback-previews';
const STORE_NAME = 'previews';
const DB_VERSION = 1;

export const PLAYBACK_PREVIEW_UPDATED_EVENT = 'playbackPreviewUpdated';

export function episodePreviewKey(animeId: string, episodeId: string): string {
  const id = animeId.trim();
  const ep = episodeId.trim();
  return `ep:${id}:${ep}`;
}

function openPreviewDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('idb_open_failed'));
  });
}

function runStoreTx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openPreviewDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('idb_request_failed'));
        tx.onerror = () => reject(tx.error ?? new Error('idb_tx_failed'));
        tx.oncomplete = () => db.close();
      }),
  );
}

export async function hasEpisodePreview(key: string): Promise<boolean> {
  if (typeof window === 'undefined' || !key.trim()) return false;
  try {
    const value = await runStoreTx('readonly', (store) => store.get(key));
    return value instanceof Blob && value.size > 0;
  } catch {
    return false;
  }
}

export async function saveEpisodePreview(key: string, blob: Blob): Promise<void> {
  if (typeof window === 'undefined' || !key.trim() || blob.size <= 0) return;
  await runStoreTx('readwrite', (store) => store.put(blob, key));
}

export async function readEpisodePreviewBlob(key: string): Promise<Blob | null> {
  if (typeof window === 'undefined' || !key.trim()) return null;
  try {
    const value = await runStoreTx<unknown>('readonly', (store) => store.get(key));
    return value instanceof Blob && value.size > 0 ? value : null;
  } catch {
    return null;
  }
}

export function emitPlaybackPreviewUpdated(animeId: string, episodeId: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(PLAYBACK_PREVIEW_UPDATED_EVENT, {
      detail: { animeId, episodeId },
    }),
  );
}
