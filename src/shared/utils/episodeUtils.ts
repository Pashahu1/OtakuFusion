/**
 * Витягує номер епізоду з id формату "anime-slug-12345?ep=107257".
 * Повертає рядок типу "107257" або undefined, якщо паттерн не знайдено.
 */
export function getEpisodeNumberFromId(id: string | undefined): string | undefined {
  if (id == null) return undefined;
  return id.match(/ep=(\d+)/)?.[1];
}
