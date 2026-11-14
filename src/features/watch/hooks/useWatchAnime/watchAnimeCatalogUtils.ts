import type { AnimeData } from '@/shared/types/animeDetailsTypes';

export function getWatchAnimeErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred.';
}

export function catalogBodyFromAnimeData(data: AnimeData, anilistKey: string) {
  return {
    anilistId: anilistKey,
    title: data.title,
    romaji_title: data.romaji_title,
    japanese_title: data.japanese_title,
    showType: data.showType,
    premiered: data.animeInfo?.Premiered,
    episodeTotal: data.animeInfo?.tvInfo?.episodeTotal,
    mal_id: data.mal_id ?? null,
    synonyms: data.animeInfo?.Synonyms,
    anilistStatus: data.animeInfo?.Status,
  };
}
