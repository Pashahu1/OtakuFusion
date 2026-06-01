import type { SpotlightAnime } from '@/shared/types/GlobalAnimeTypes';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { WatchSpotlightArtwork } from '../hooks/useWatchSpotlightArtwork';

function parseMalScorePercent(raw: string | undefined): number | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n <= 10 ? Math.round(n * 10) : Math.round(n);
}

export function buildWatchHeroModel(
  anime: AnimeData,
  artwork: WatchSpotlightArtwork | undefined
): SpotlightAnime {
  const tv = anime.animeInfo?.tvInfo;
  const scorePercent = parseMalScorePercent(anime.animeInfo?.['MAL Score']);

  return {
    id: anime.id,
    data_id: anime.data_id,
    poster: anime.poster,
    title: anime.title,
    japanese_title: anime.japanese_title,
    description: anime.animeInfo?.Overview ?? '',
    tvInfo: tv ?? {
      showType: anime.showType ?? '',
      duration: '',
      releaseDate: '',
      quality: '',
    },
    scorePercent,
    genres: anime.animeInfo?.Genres,
    malId: anime.mal_id ?? undefined,
    clearLogoUrl: artwork?.clearLogoUrl ?? undefined,
    heroImageUrl: artwork?.heroImageUrl ?? undefined,
    seasonLabel: artwork?.seasonLabel ?? undefined,
  };
}
