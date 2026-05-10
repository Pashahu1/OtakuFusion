import type { TvInfo } from '@/shared/types/GlobalAnimeTypes';

/** Короткий рядок для карток / hero: Sub | Dub — лише якщо каталог віддав лічильники > 0. */
export function getStreamAvailabilityLabel(tv: TvInfo | undefined): string | null {
  if (!tv) return null;
  const subCount = tv.has_sub ?? 0;
  const dubCount = tv.has_dub ?? 0;
  if (subCount > 0 && dubCount > 0) return 'Sub | Dub';
  if (subCount > 0) return 'Sub';
  if (dubCount > 0) return 'Dub';
  return null;
}
