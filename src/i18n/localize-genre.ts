type Translate = (key: string, options?: { defaultValue?: string }) => string;

export function localizeGenreName(genre: string, t: Translate): string {
  const name = genre.trim();
  if (!name) return genre;
  return t(`genreNames.${name}`, { defaultValue: name });
}
