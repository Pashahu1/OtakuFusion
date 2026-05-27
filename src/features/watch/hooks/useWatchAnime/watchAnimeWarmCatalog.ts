import type { MutableRefObject } from 'react';
import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';
import type { WarmAlternateCatalogEntry } from './types';

export function upsertWarmLibertyCatalog(
  warmRef: MutableRefObject<WarmAlternateCatalogEntry | null>,
  animeId: string,
  libertyId: string,
  episodes: EpisodesTypes[]
): void {
  const id = libertyId.trim();
  if (!animeId.trim() || !id || !episodes.length) return;
  const prev = warmRef.current;
  warmRef.current = {
    animeId,
    hikka: prev?.animeId === animeId ? prev.hikka : undefined,
    liberty: { libertyId: id, episodes },
  };
}

export function upsertWarmHikkaCatalog(
  warmRef: MutableRefObject<WarmAlternateCatalogEntry | null>,
  animeId: string,
  slug: string,
  episodes: EpisodesTypes[]
): void {
  const s = slug.trim();
  if (!animeId.trim() || !s || !episodes.length) return;
  const prev = warmRef.current;
  warmRef.current = {
    animeId,
    liberty: prev?.animeId === animeId ? prev.liberty : undefined,
    hikka: { slug: s, episodes },
  };
}
