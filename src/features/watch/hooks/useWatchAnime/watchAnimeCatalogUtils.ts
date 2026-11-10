import {
  ANIKOTO_PLAYBACK_ENABLED,
  type WatchStreamProvider,
} from '@/features/watch/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { AlternateLanguageMenuSetters } from './types';
import {
  readVerifiedAnikotoMapping,
  readVerifiedHikkaMapping,
} from '@/features/watch/lib/provider-mapping-cache';

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

export function applyCachedAnikotoLanguageMenu(
  localAnimeId: string,
  apply: Pick<
    AlternateLanguageMenuSetters,
    'setAnikotoCatalogProviderId' | 'setAnikotoLanguageMenuEligible'
  >,
): boolean {
  if (!ANIKOTO_PLAYBACK_ENABLED) return false;
  const cached = readVerifiedAnikotoMapping(localAnimeId);
  if (!cached?.anikotoSlug) return false;
  apply.setAnikotoCatalogProviderId(cached.anikotoSlug);
  apply.setAnikotoLanguageMenuEligible(true);
  return true;
}

export function restoreCachedAlternateLanguageMenu(
  localAnimeId: string,
  activeProvider: WatchStreamProvider,
  apply: AlternateLanguageMenuSetters
): void {
  if (activeProvider !== 'hikka') {
    const cachedHikka = readVerifiedHikkaMapping(localAnimeId);
    if (cachedHikka?.hikkaSlug) {
      apply.setHikkaCatalogProviderId(cachedHikka.hikkaSlug);
      apply.setHikkaLanguageMenuEligible(true);
    }
  }
  if (ANIKOTO_PLAYBACK_ENABLED && activeProvider !== 'anikoto') {
    const cachedAnikoto = readVerifiedAnikotoMapping(localAnimeId);
    if (cachedAnikoto?.anikotoSlug) {
      apply.setAnikotoCatalogProviderId(cachedAnikoto.anikotoSlug);
      apply.setAnikotoLanguageMenuEligible(true);
    }
  }
}
