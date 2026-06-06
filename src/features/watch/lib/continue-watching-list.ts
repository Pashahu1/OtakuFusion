import { mediaHasBlockedGenre } from '@/lib/anime-content-policy';
import { CONTINUE_WATCHING_STORAGE_KEY } from '@/features/player/ui/updateContinueWatching';
import type { ContinueWatchingEntry } from '@/shared/types/ContinueWatchingEntry';

export { CONTINUE_WATCHING_STORAGE_KEY };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Validates localStorage JSON without pulling Zod into client chunks. */
export function parseContinueWatchingList(raw: string | null): ContinueWatchingEntry[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const valid: ContinueWatchingEntry[] = [];
    for (const item of parsed) {
      if (!isRecord(item)) continue;

      const id = item.id;
      const episodeId = item.episodeId;
      if (
        typeof id !== 'string' ||
        id === '' ||
        typeof episodeId !== 'string' ||
        episodeId === ''
      ) {
        continue;
      }

      const rawDataId = item.data_id;
      const data_id =
        typeof rawDataId === 'number'
          ? rawDataId
          : typeof rawDataId === 'string'
            ? Number(rawDataId)
            : NaN;
      if (!Number.isFinite(data_id)) continue;

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
        watchStreamProviderRaw === 'aniliberty' ||
        watchStreamProviderRaw === 'hikka' ||
        watchStreamProviderRaw === 'anikoto'
          ? watchStreamProviderRaw
          : undefined;

      const streamLangRaw = item.streamLang;
      const streamLang =
        streamLangRaw === 'sub' || streamLangRaw === 'dub' ? streamLangRaw : undefined;

      valid.push({
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
      });
    }

    return valid
      .filter((entry) => !mediaHasBlockedGenre(entry.genres))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  } catch {
    return [];
  }
}

export function readContinueWatchingList(): ContinueWatchingEntry[] {
  if (typeof window === 'undefined') return [];
  return parseContinueWatchingList(localStorage.getItem(CONTINUE_WATCHING_STORAGE_KEY));
}
