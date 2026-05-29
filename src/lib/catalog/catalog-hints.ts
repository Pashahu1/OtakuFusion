export interface CatalogHints {
  format?: string | null;
  seasonYear?: number | null;
  episodeCount?: number | null;
  anilistId?: number | null;
  malId?: number | null;
  isStillAiring?: boolean | null;
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
    .replace(/（[^）]{0,400}）/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  add(noParen);
  for (const part of noParen.split(/[:\|｜]/)) add(part.trim());
  add(noParen.replace(/[\-_·•]+/g, ' ').replace(/\s+/g, ' ').trim());
  return pool.sort((a, b) => b.length - a.length);
}

export interface CatalogRequestFields {
  title: string;
  romaji_title?: string;
  japanese_title?: string;
  synonyms?: string;
}

export function buildCatalogSearchTermsFromFields(f: CatalogRequestFields): string[] {
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

export function buildCatalogSearchQueryQueue(baseTerms: string[]): string[] {
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

export function normalizeCatalogSearchQuery(raw: string): string {
  let s = raw.trim().normalize('NFKC');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/[\s\u00A0._…·。]+$/gu, '').trim();
  s = s.replace(/[.:;，、\-–—]+$/gu, '').trim();
  return s;
}
