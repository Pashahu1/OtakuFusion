export function getEpisodeNumberFromId(id: string | undefined): string | undefined {
  if (id == null) return undefined;
  const fromQuery = id.match(/ep=([\d.]+)/i)?.[1];
  if (fromQuery) return fromQuery;
  const trimmed = id.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed;
  return undefined;
}

/** Порівняння активного епізоду з id каталогу (Animepahe `?ep=N` або Hikka `"N"`). */
export function episodeMatchesSelection(
  ep: { id: string; episode_no: number },
  selected: string | null | undefined
): boolean {
  if (selected == null || selected === '') return false;
  const fromId = getEpisodeNumberFromId(ep.id);
  if (fromId != null && fromId === selected) return true;
  return String(ep.episode_no) === selected;
}
