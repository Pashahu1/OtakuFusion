import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

export interface AnilibriaEpisodeRaw {
  id?: string;
  name?: string | null;
  name_english?: string | null;
  ordinal?: number;
  sort_order?: number;
  opening?: { start?: number | null; stop?: number | null } | null;
  ending?: { start?: number | null; stop?: number | null } | null;
  hls_480?: string | null;
  hls_720?: string | null;
  hls_1080?: string | null;
}

function episodeSortKey(ep: AnilibriaEpisodeRaw): number {
  const so = ep.sort_order;
  if (typeof so === 'number' && Number.isFinite(so)) return so;
  const ord = ep.ordinal;
  if (typeof ord === 'number' && Number.isFinite(ord)) return ord;
  return 0;
}

export function sortAnilibriaEpisodes(list: AnilibriaEpisodeRaw[]): AnilibriaEpisodeRaw[] {
  return [...list].sort((a, b) => episodeSortKey(a) - episodeSortKey(b));
}

function isMostlyCyrillic(text: string): boolean {
  const t = text.trim();
  if (t.length < 2) return false;
  const cyr = (t.match(/[\u0400-\u04FF]/g) ?? []).length;
  return cyr / t.length > 0.35;
}

function episodeDisplayTitle(raw: AnilibriaEpisodeRaw, seq: number): string {
  const en = raw.name_english?.trim();
  if (en) return en;
  const main = raw.name?.trim();
  if (main && !isMostlyCyrillic(main)) return main;
  return `Episode ${seq}`;
}

function toEpisodeQueryId(sequence: number): string {
  return `?ep=${sequence}`;
}

/**
 * Лінійний номер у списку (= `?ep=N`) збігається з індексом для /api/anilibria/stream.
 */
export function mapAnilibriaEpisodesToList(sorted: AnilibriaEpisodeRaw[]): EpisodesTypes[] {
  return sorted.map((raw, idx) => {
    const seq = idx + 1;
    const label = episodeDisplayTitle(raw, seq);
    return {
      episode_no: seq,
      id: toEpisodeQueryId(seq),
      data_id: seq,
      jname: '',
      title: label,
      japanese_title: '',
      filler: false,
      hasSub: true,
      hasDub: false,
      ep_token: raw.id?.trim() || undefined,
    };
  });
}
