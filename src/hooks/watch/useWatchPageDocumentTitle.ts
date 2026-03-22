import { WEBSITE_NAME } from '@/config/website';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useEffect } from 'react';

export function useWatchPageDocumentTitle(
  animeInfo: AnimeData | null,
  animeId: string
) {
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${WEBSITE_NAME}`;
    }

    return () => {
      document.title = `${WEBSITE_NAME} | Free anime streaming platform`;
    };
  }, [animeId, animeInfo]);
}
