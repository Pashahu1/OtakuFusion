export function getEpisodeNumberFromId(id: string | undefined): string | undefined {
  if (id == null) return undefined;
  return id.match(/ep=(\d+)/)?.[1];
}
