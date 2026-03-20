import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

type StoredEntry = {
  id: string;
  data_id: number;
  episodeId: string;
  episodeNum?: number | null;
  adultContent?: boolean;
  poster?: string;
  title?: string;
  japanese_title?: string;
};

export function updateContinueWatching(
  animeInfo: AnimeInfo | null,
  episodeId: string | null,
  episodeNum: number | null
) {
  if (typeof window === 'undefined') return;
  if (!animeInfo || !animeInfo.id || !animeInfo.data_id) return;
  if (!episodeId) return;

  try {
    const raw = localStorage.getItem('continueWatching') || '[]';
    const parsed: unknown = JSON.parse(raw);
    const continueWatching = Array.isArray(parsed)
      ? (parsed as StoredEntry[])
      : [];

    const newEntry: StoredEntry = {
      id: animeInfo.id,
      data_id: animeInfo.data_id,
      episodeId,
      episodeNum,
      adultContent: animeInfo.adultContent,
      poster: animeInfo.poster,
      title: animeInfo.title,
      japanese_title: animeInfo.japanese_title,
    };

    const existingIndex = continueWatching.findIndex(
      (item) => item.data_id === newEntry.data_id || item.id === newEntry.id
    );

    if (existingIndex !== -1) {
      continueWatching[existingIndex] = newEntry;
    } else {
      continueWatching.push(newEntry);
    }

    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
  } catch {
    return;
  }
}
