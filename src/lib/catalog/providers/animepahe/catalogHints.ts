import type { AnimeData } from '@/shared/types/animeDetailsTypes';

/** ╨ƒ╤û╨┤╨║╨░╨╖╨║╨╕ ╨╖ AniList ╨┤╨╗╤Å ╨╖╤û╤ü╤é╨░╨▓╨╗╨╡╨╜╨╜╤Å ╨╖ ╨║╨░╤Ç╤é╨║╨╛╤Ä Animepahe (╤Ç╤û╨║, ╤ä╨╛╤Ç╨╝╨░╤é, ╨╗╤û╤ç╨╕╨╗╤î╨╜╨╕╨║╨╕). */
export interface AnimepaheCatalogHints {
  format?: string | null;
  seasonYear?: number | null;
  episodeCount?: number | null;
  anilistId?: number | null;
  malId?: number | null;
  /** AniList `Status` ΓÇö ┬½Currently Airing┬╗ ╤é╨╛╤ë╨╛; ╨┤╨╗╤Å Anilibria ╨┤╨╛╨╖╨▓╨╛╨╗╤Å╤ö ╨╝╨╡╨╜╤ê╨╕╨╣ ep count. */
  isStillAiring?: boolean | null;
}

export function buildAnimepaheCatalogHints(data: AnimeData): AnimepaheCatalogHints {
  const format = data.showType?.trim() || null;
  const prem = data.animeInfo?.Premiered?.trim();
  let seasonYear: number | null = null;
  if (prem && /^\d{4}$/.test(prem)) {
    seasonYear = parseInt(prem, 10);
  }
  const subEp = data.animeInfo?.tvInfo?.episodeTotal?.trim();
  let episodeCount: number | null = null;
  if (subEp && /^\d+$/.test(subEp)) {
    episodeCount = parseInt(subEp, 10);
  }
  const anilistId =
    typeof data.id === 'string' && /^\d+$/.test(data.id.trim())
      ? parseInt(data.id.trim(), 10)
      : null;
  const malId =
    typeof data.mal_id === 'number' && Number.isFinite(data.mal_id) && data.mal_id > 0
      ? Math.floor(data.mal_id)
      : null;
  const status = data.animeInfo?.Status?.trim() || null;
  const isStillAiring =
    typeof status === 'string' &&
    (status.toLowerCase().includes('currently airing') ||
      status.toLowerCase().includes('releasing') ||
      status.toLowerCase() === 'airing');

  return { format, seasonYear, episodeCount, anilistId, malId, isStillAiring };
}

export function buildAnimepaheSearchTerms(data: AnimeData): string[] {
  const push = (arr: string[], s: string | undefined | null) => {
    const t = s?.trim();
    if (t && t.length >= 2 && !arr.includes(t)) arr.push(t);
  };
  const primary: string[] = [];
  push(primary, data.animeInfo?.Japanese);
  push(primary, data.romaji_title);
  primary.sort((a, b) => b.length - a.length);

  const secondary: string[] = [];
  push(secondary, data.title);
  push(secondary, data.japanese_title);
  const parts = (data.animeInfo?.Synonyms ?? '').split(',');
  for (const p of parts) push(secondary, p.trim());
  secondary.sort((a, b) => b.length - a.length);

  const out: string[] = [...primary];
  for (const t of secondary) {
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

function expandSearchQueryVariants(raw: string): string[] {
  const t = raw.trim().normalize('NFKC');
  if (t.length < 2) return [];
  const pool: string[] = [];
  const add = (s: string) => {
    const x = s.trim().replace(/\s+/g, ' ');
    if (x.length >= 2 && !pool.includes(x)) pool.push(x);
  };
  add(t);
  const noParen = t
    .replace(/\([^)]{0,400}\)/g, ' ')
    .replace(/∩╝ê[^∩╝ë]{0,400}∩╝ë/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  add(noParen);
  for (const part of noParen.split(/[:\|∩╜£]/)) add(part.trim());
  add(noParen.replace(/[\-_┬╖ΓÇó]+/g, ' ').replace(/\s+/g, ' ').trim());
  return pool.sort((a, b) => b.length - a.length);
}

export interface AnimepaheCatalogRequestFields {
  title: string;
  romaji_title?: string;
  japanese_title?: string;
  synonyms?: string;
}

export function buildAnimepaheSearchTermsFromFields(
  f: AnimepaheCatalogRequestFields
): string[] {
  const push = (arr: string[], s: string | undefined | null) => {
    const t = s?.trim();
    if (t && t.length >= 2 && !arr.includes(t)) arr.push(t);
  };
  const primary: string[] = [];
  push(primary, f.japanese_title);
  push(primary, f.romaji_title);
  primary.sort((a, b) => b.length - a.length);

  const secondary: string[] = [];
  push(secondary, f.title);
  const parts = (f.synonyms ?? '').split(',');
  for (const p of parts) push(secondary, p.trim());
  secondary.sort((a, b) => b.length - a.length);

  const out: string[] = [...primary];
  for (const t of secondary) {
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

export function buildAnimepaheSearchQueryQueue(baseTerms: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const term of baseTerms) {
    for (const v of expandSearchQueryVariants(term)) {
      const q = v.trim();
      if (q.length < 2 || seen.has(q)) continue;
      seen.add(q);
      out.push(q);
    }
  }
  return out;
}

/**
 * Crysoline search ╤ç╤â╤é╨╗╨╕╨▓╨╕╨╣ ╨┤╨╛ ╨╖╨░╨╣╨▓╨╕╤à ╨┐╤Ç╨╛╨▒╤û╨╗╤û╨▓ ╤û ╨║╤û╨╜╤å╨╡╨▓╨╛╤ù ╨┐╤â╨╜╨║╤é╤â╨░╤å╤û╤ù
 * (╨╜╨░╨┐╤Ç╨╕╨║╨╗╨░╨┤ ┬½Season 4 .┬╗ ╨┤╨░╤ö `[]`, ╨░ ┬½Season 4┬╗ ΓÇö ╨╖╨▒╤û╨│╨╕).
 */
export function normalizeCatalogSearchQuery(raw: string): string {
  let s = raw.trim().normalize('NFKC');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/[\s\u00A0._ΓÇª┬╖πÇé]+$/gu, '').trim();
  s = s.replace(/[.:;∩╝îπÇü\-ΓÇôΓÇö]+$/gu, '').trim();
  return s;
}
