export function getEpisodeNumberFromId(id: string | undefined): string | undefined {
  if (id == null) return undefined;
  const fromQuery = id.match(/ep=([\d.]+)/i)?.[1];
  if (fromQuery) return fromQuery;
  const trimmed = id.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) return trimmed;
  return undefined;
}

/** Stable key for CW, resume, and IndexedDB previews (`1`, not `?ep=1`). */
export function normalizeEpisodeStorageKey(
  episodeId: string | null | undefined,
  episodeNum?: number | null,
): string {
  if (episodeNum != null && Number.isFinite(episodeNum)) {
    return String(episodeNum);
  }
  return getEpisodeNumberFromId(episodeId ?? undefined) ?? episodeId?.trim() ?? '';
}

/** Compare active episode to catalog id (Anicore `?ep=N` or Hikka `"N"`). */
export function episodeMatchesSelection(
  ep: { id: string; episode_no: number },
  selected: string | null | undefined
): boolean {
  if (selected == null || selected === '') return false;
  const fromId = getEpisodeNumberFromId(ep.id);
  if (fromId != null && fromId === selected) return true;
  return String(ep.episode_no) === selected;
}
