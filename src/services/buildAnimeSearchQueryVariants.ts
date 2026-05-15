const EN_STOP = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'to',
  'in',
  'for',
  'on',
  'at',
  'by',
  'with',
  'from',
  'as',
  'season',
  'cour',
  'part',
  'tv',
  'ova',
  'ona',
  'special',
]);

function stripEdgePunct(w: string): string {
  return w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

/**
 * Варіанти від «як у користувача» до коротшого ядра — AniList інколи нічого не дає на довгий / «шумний» рядок.
 * Порядок: від більш специфічного до ширшого; пошук зупиняється на першому варіанті з результатами.
 */
export function buildAnimeSearchQueryVariants(raw: string): string[] {
  const t = raw.trim().normalize('NFKC').replace(/\s+/g, ' ');
  const out: string[] = [];
  const add = (s: string) => {
    const x = s.trim().replace(/\s+/g, ' ');
    if (x.length < 2 || out.includes(x)) return;
    out.push(x);
  };
  if (!t) return out;

  add(t);
  add(t.replace(/["""'''`«»]/g, ''));

  const noParen = t
    .replace(/\([^)]{0,400}\)/g, ' ')
    .replace(/（[^）]{0,400}）/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  add(noParen);

  const noSeason = noParen
    .replace(/\b(?:season|cour|part)\s*\d+\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  add(noSeason);

  const pieces = noSeason
    .split(/[|｜/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  pieces.sort((a, b) => b.length - a.length);
  for (const p of pieces) add(p);

  const words = noSeason
    .toLowerCase()
    .split(/\s+/)
    .map(stripEdgePunct)
    .filter((w) => w.length >= 2 && !EN_STOP.has(w));
  if (words.length >= 2) {
    add(words.slice(0, 6).join(' '));
  }
  const longest = [...words].sort((a, b) => b.length - a.length)[0];
  if (longest && longest.length >= 3) add(longest);

  return out;
}
