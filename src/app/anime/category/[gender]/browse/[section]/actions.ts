'use server';

import {
  getGenreBrowsePage,
  type GenreBrowseResult,
} from '@/lib/api/genre-hub';
import type { GenreMediaFilter } from '@/shared/data/genre-hub';

export async function loadGenreBrowsePage(input: {
  genre: string;
  sectionId: string;
  media: GenreMediaFilter;
  page: number;
}): Promise<GenreBrowseResult | null> {
  return getGenreBrowsePage({
    genre: input.genre,
    sectionId: input.sectionId,
    media: input.media,
    page: input.page,
  });
}
