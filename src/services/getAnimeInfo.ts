import {
  getAniListMediaById,
  mapAniListMediaToAnimeDetails,
} from '@/lib/anilist';
import type { AnimeResults } from '@/shared/types/animeDetailsTypes';

export async function getAnimeInfo(
  id: string
): Promise<AnimeResults> {
  const media = await getAniListMediaById(id);
  return mapAniListMediaToAnimeDetails(media);
}
