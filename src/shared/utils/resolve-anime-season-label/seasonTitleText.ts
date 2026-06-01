import { NTH_SUFFIX, ROMAN_NUMERALS } from './seasonConstants';

export function titleMentionsSeason(title: string, season: number): boolean {
  const t = title.toLowerCase();
  const roman = ROMAN_NUMERALS[season]?.toLowerCase();
  const patterns = [
    new RegExp(`\\bseason\\s*${season}\\b`, 'i'),
    new RegExp(`\\bpart\\s*${season}\\b`, 'i'),
    new RegExp(`\\bcour\\s*${season}\\b`, 'i'),
    new RegExp(`\\bs${season}\\b`, 'i'),
    new RegExp(`\\b${season}(?:st|nd|rd|th)\\s+season\\b`, 'i'),
  ];
  if (roman) {
    patterns.push(new RegExp(`\\bseason\\s+${roman}\\b`, 'i'));
    patterns.push(new RegExp(`\\b${roman}\\b`, 'i'));
  }
  return patterns.some((pattern) => pattern.test(t));
}

export function formatSeasonLabel(season: number): string {
  return `Season ${season}`;
}

export function stripSeasonFromTitle(title: string): string {
  return title
    .replace(/\s*:\s*season\s+\d+/gi, '')
    .replace(/\s+season\s+\d+\s*$/gi, '')
    .replace(/\s+part\s+\d+\s*$/gi, '')
    .replace(/\s+cour\s+\d+\s*$/gi, '')
    .replace(/\s+s\d+\s*$/gi, '')
    .trim();
}

function nthSeasonWord(season: number): string {
  return NTH_SUFFIX[season] ?? `${season}th`;
}

export function buildSeasonTitleVariants(base: string, season: number): string[] {
  const roman = ROMAN_NUMERALS[season];
  const nth = nthSeasonWord(season);
  const variants = [
    `${base} season ${season}`,
    `${base} Season ${season}`,
    `${base} - Season ${season}`,
    `${base}: Season ${season}`,
    `${base} — Season ${season}`,
    `${base} S${season}`,
    `${base} S0${season}`,
    `${base} Part ${season}`,
    `${base} Cour ${season}`,
    `${base} ${nth} Season`,
    `${base} ${nth} season`,
    `${base} (${season})`,
    `${base} [Season ${season}]`,
    `Season ${season} ${base}`,
    `${base} Season ${String(season).padStart(2, '0')}`,
  ];

  if (roman) {
    variants.push(
      `${base} ${roman}`,
      `${base} Season ${roman}`,
      `${base} - ${roman}`,
      `${base}: ${roman}`,
    );
  }

  return variants;
}
