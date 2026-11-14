import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { AlternateLanguageMenuSetters } from './types';
import { readVerifiedHikkaMapping } from '@/features/watch/lib/provider-mapping-cache';

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

export function restoreCachedAlternateLanguageMenu(
  localAnimeId: string,
  activeProvider: WatchStreamProvider,
  apply: AlternateLanguageMenuSetters,
): void {
  if (activeProvider === 'hikka') return;
  const cachedHikka = readVerifiedHikkaMapping(localAnimeId);
  if (cachedHikka?.hikkaSlug) {
    apply.setHikkaCatalogProviderId(cachedHikka.hikkaSlug);
    apply.setHikkaLanguageMenuEligible(true);
  }
}
