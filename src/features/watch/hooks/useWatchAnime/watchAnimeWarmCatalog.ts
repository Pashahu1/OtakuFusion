import type { MutableRefObject } from 'react';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { WarmAlternateCatalogEntry } from './types';

export function upsertWarmHikkaCatalog(
  warmRef: MutableRefObject<WarmAlternateCatalogEntry | null>,
  animeId: string,
  slug: string,
  episodes: EpisodesTypes[]
): void {
  const s = slug.trim();
  if (!animeId.trim() || !s || !episodes.length) return;
  warmRef.current = {
    animeId,
    hikka: { slug: s, episodes },
  };
}
