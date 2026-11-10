import type { TFunction } from 'i18next';

export function localizeGenreName(genre: string, t: TFunction): string {
  const name = genre.trim();
  if (!name) return genre;
  return t(`genreNames.${name}`, { defaultValue: name });
}
