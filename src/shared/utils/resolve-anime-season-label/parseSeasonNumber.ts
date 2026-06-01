import { ORDINAL_WORDS, ROMAN_NUMERALS } from './seasonConstants';

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, ' ');
}

function parseSeasonFromChunk(text: string): number | null {
  const normalized = stripHtml(text).replace(/\s+/g, ' ');

  const ordinalSeason = normalized.match(
    /\b(?:the\s+)?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+season\b/i,
  );
  if (ordinalSeason?.[1]) {
    const n = ORDINAL_WORDS[ordinalSeason[1].toLowerCase()];
    if (n) return n;
  }

  const seasonN = normalized.match(/\bseason\s+(\d{1,2})\b/i);
  if (seasonN?.[1]) return Number(seasonN[1]);

  const nthSeason = normalized.match(/\b(\d{1,2})(?:st|nd|rd|th)\s+season\b/i);
  if (nthSeason?.[1]) return Number(nthSeason[1]);

  const partN = normalized.match(/\bpart\s+(\d{1,2})\b/i);
  if (partN?.[1]) return Number(partN[1]);

  const courN = normalized.match(/\bcour\s+(\d{1,2})\b/i);
  if (courN?.[1]) return Number(courN[1]);

  const trailingSeason = normalized.match(/\bseason\s+(\d{1,2})\s*$/i);
  if (trailingSeason?.[1]) return Number(trailingSeason[1]);

  const romanSeason = normalized.match(
    /\bseason\s+(i{1,3}|iv|vi{0,3}|ix|xi{0,2})\s*$/i,
  );
  if (romanSeason?.[1]) {
    const roman = romanSeason[1].toUpperCase();
    const idx = ROMAN_NUMERALS.indexOf(roman);
    if (idx > 0) return idx;
  }

  return null;
}

export function parseSeasonNumberFromText(
  ...texts: Array<string | null | undefined>
): number | null {
  for (const raw of texts) {
    if (!raw?.trim()) continue;
    const season = parseSeasonFromChunk(raw);
    if (season !== null && season >= 1 && season <= 99) return season;
  }
  return null;
}

export function resolveAnimeSeasonNumber(input: {
  title: string;
  description?: string;
  synonyms?: string[];
}): number | null {
  return (
    parseSeasonNumberFromText(input.title, ...(input.synonyms ?? [])) ??
    parseSeasonNumberFromText(input.description)
  );
}
