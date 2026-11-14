import { mediaHasBlockedGenre } from '@/lib/anime-content-policy';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';

export const CONTINUE_WATCHING_STORAGE_KEY = 'continueWatching';

export const MAX_CONTINUE_WATCHING_ENTRIES = 40;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function continueWatchingEntryKey(entry: ContinueWatchingEntry): string {
  return entry.id || String(entry.data_id);
}

export function normalizeContinueWatchingEntry(
  item: unknown,
): ContinueWatchingEntry | null {
  if (!isRecord(item)) return null;

  const id = item.id;
  const episodeId = item.episodeId;
  if (
    typeof id !== 'string' ||
    id === '' ||
    typeof episodeId !== 'string' ||
    episodeId === ''
  ) {
    return null;
  }

  const rawDataId = item.data_id;
  const data_id =
    typeof rawDataId === 'number'
      ? rawDataId
      : typeof rawDataId === 'string'
        ? Number(rawDataId)
        : NaN;
  if (!Number.isFinite(data_id)) return null;

  const episodeNum =
    typeof item.episodeNum === 'number' ? item.episodeNum : undefined;

  const rawUpdated = item.updatedAt;
  const updatedAt =
    typeof rawUpdated === 'number' && Number.isFinite(rawUpdated) ? rawUpdated : 0;

  const positionSeconds =
    typeof item.positionSeconds === 'number' && Number.isFinite(item.positionSeconds)
      ? item.positionSeconds
      : undefined;
  const durationSeconds =
    typeof item.durationSeconds === 'number' && Number.isFinite(item.durationSeconds)
      ? item.durationSeconds
      : undefined;

  const watchStreamProviderRaw = item.watchStreamProvider;
  const watchStreamProvider =
    watchStreamProviderRaw === 'anilibria' || watchStreamProviderRaw === 'aniliberty'
      ? 'hikka'
      : watchStreamProviderRaw === 'hikka' || watchStreamProviderRaw === 'anikoto'
        ? 'hikka'
        : undefined;

  const streamLangRaw = item.streamLang;
  const streamLang =
    streamLangRaw === 'sub' || streamLangRaw === 'dub' ? streamLangRaw : undefined;
  const playbackAudioRaw = item.playbackAudio;
  const playbackAudio =
    playbackAudioRaw === 'uk' || playbackAudioRaw === 'ja' || playbackAudioRaw === 'en'
      ? playbackAudioRaw
      : undefined;

  const entry: ContinueWatchingEntry = {
    id,
    data_id,
    episodeId,
    episodeNum,
    poster: typeof item.poster === 'string' ? item.poster : undefined,
    title: typeof item.title === 'string' ? item.title : undefined,
    japanese_title:
      typeof item.japanese_title === 'string' ? item.japanese_title : undefined,
    adultContent:
      typeof item.adultContent === 'boolean' ? item.adultContent : undefined,
    genres: Array.isArray(item.genres)
      ? item.genres.filter((g): g is string => typeof g === 'string')
      : undefined,
    positionSeconds,
    durationSeconds,
    updatedAt,
    watchStreamProvider,
    streamLang,
    playbackAudio,
  };

  if (mediaHasBlockedGenre(entry.genres)) return null;
  return entry;
}

function sortContinueWatching(
  entries: ContinueWatchingEntry[],
): ContinueWatchingEntry[] {
  return [...entries].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

/** Validates localStorage JSON without pulling Zod into client chunks. */
export function parseContinueWatchingList(raw: string | null): ContinueWatchingEntry[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const valid: ContinueWatchingEntry[] = [];
    for (const item of parsed) {
      const entry = normalizeContinueWatchingEntry(item);
      if (entry) valid.push(entry);
    }

    return sortContinueWatching(valid).slice(0, MAX_CONTINUE_WATCHING_ENTRIES);
  } catch {
    return [];
  }
}

export function parseContinueWatchingEntries(
  items: unknown,
): ContinueWatchingEntry[] {
  if (!Array.isArray(items)) return [];
  const valid: ContinueWatchingEntry[] = [];
  for (const item of items) {
    const entry = normalizeContinueWatchingEntry(item);
    if (entry) valid.push(entry);
  }
  return sortContinueWatching(valid).slice(0, MAX_CONTINUE_WATCHING_ENTRIES);
}

export function mergeContinueWatchingLists(
  local: ContinueWatchingEntry[],
  remote: ContinueWatchingEntry[],
): ContinueWatchingEntry[] {
  const byKey = new Map<string, ContinueWatchingEntry>();
  for (const entry of [...remote, ...local]) {
    const key = continueWatchingEntryKey(entry);
    const prev = byKey.get(key);
    if (!prev || (entry.updatedAt ?? 0) >= (prev.updatedAt ?? 0)) {
      byKey.set(key, entry);
    }
  }
  return sortContinueWatching([...byKey.values()]).slice(
    0,
    MAX_CONTINUE_WATCHING_ENTRIES,
  );
}

function emitContinueWatchingUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('continueWatchingUpdated'));
}

export function readContinueWatchingList(): ContinueWatchingEntry[] {
  if (typeof window === 'undefined') return [];
  return parseContinueWatchingList(localStorage.getItem(CONTINUE_WATCHING_STORAGE_KEY));
}

export function writeContinueWatchingList(
  entries: ContinueWatchingEntry[],
): void {
  if (typeof window === 'undefined') return;
  const next = sortContinueWatching(entries).slice(
    0,
    MAX_CONTINUE_WATCHING_ENTRIES,
  );
  localStorage.setItem(CONTINUE_WATCHING_STORAGE_KEY, JSON.stringify(next));
  emitContinueWatchingUpdated();
}
