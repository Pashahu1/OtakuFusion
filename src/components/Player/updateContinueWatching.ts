import type { AnimeInfo } from '@/shared/types/GlobalAnimeTypes';

export function updateContinueWatching(
  animeInfo: AnimeInfo | null,
  episodeId: string | null,
  episodeNum: number | null
) {
  const continueWatching = (JSON.parse(
    localStorage.getItem('continueWatching') || '[]'
  ) || []) as Array<{ data_id?: number }>;

  const newEntry = {
    id: animeInfo?.id,
    data_id: animeInfo?.data_id,
    episodeId,
    episodeNum,
    adultContent: animeInfo?.adultContent,
    poster: animeInfo?.poster,
    title: animeInfo?.title,
    japanese_title: animeInfo?.japanese_title,
  };

  if (!newEntry.data_id) return;

  const existingIndex = continueWatching.findIndex(
    (item: { data_id?: number }) => item.data_id === newEntry.data_id
  );

  if (existingIndex !== -1) {
    continueWatching[existingIndex] = newEntry;
  } else {
    continueWatching.push(newEntry);
  }
  localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
}
