import type { WatchStreamProvider } from '@/lib/watch-provider';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import {
  isAnilibertyEpisodeCountAcceptable,
  isAnilistStillAiringFromStatus,
} from '@/services/aniliberty/anilibertyEpisodeMatch';
import type { AlternateLanguageMenuSetters } from './types';
import {
  readVerifiedHikkaMapping,
  readVerifiedLibertyMapping,
} from './watchAnimeMappingCache';

export function getWatchAnimeErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'An error occurred.';
}

function readExpectedEpisodeCountFromAnime(data: AnimeData): number | null {
  const et = data.animeInfo?.tvInfo?.episodeTotal?.trim();
  if (!et || !/^\d+$/.test(et)) return null;
  const n = parseInt(et, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function isLibertyCatalogAcceptableForAnime(
  data: AnimeData,
  actualEpisodeCount: number
): boolean {
  const stillAiring = isAnilistStillAiringFromStatus(data.animeInfo?.Status);
  return isAnilibertyEpisodeCountAcceptable(
    readExpectedEpisodeCountFromAnime(data),
    actualEpisodeCount,
    { isOngoing: stillAiring, allowPartialCatalog: stillAiring }
  );
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
  apply: AlternateLanguageMenuSetters
): void {
  if (activeProvider !== 'hikka') {
    const cachedHikka = readVerifiedHikkaMapping(localAnimeId);
    if (cachedHikka?.hikkaSlug) {
      apply.setHikkaCatalogProviderId(cachedHikka.hikkaSlug);
      apply.setHikkaLanguageMenuEligible(true);
    }
  }
  if (activeProvider !== 'aniliberty') {
    const cachedLiberty = readVerifiedLibertyMapping(localAnimeId);
    if (cachedLiberty?.libertyId) {
      apply.setAnilibertyCatalogProviderId(cachedLiberty.libertyId);
      apply.setAnilibertyLanguageMenuEligible(true);
    }
  }
}
