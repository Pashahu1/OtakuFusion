const ORDINAL_WORDS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

const ROMAN_NUMERALS = [
  '',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

const NTH_SUFFIX: Record<number, string> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
};

function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, ' ');
}

function parseSeasonFromChunk(text: string): number | null {
  const normalized = stripHtml(text).replace(/\s+/g, ' ');

  const ordinalSeason = normalized.match(
    /\b(?:the\s+)?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+season\b/i
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
    /\bseason\s+(i{1,3}|iv|vi{0,3}|ix|xi{0,2})\s*$/i
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

function buildSeasonTitleVariants(base: string, season: number): string[] {
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
      `${base}: ${roman}`
    );
  }

  return variants;
}

/** Показувати текст «Season N» лише якщо TVDB не дав сезонно-специфічний матч. */
export function resolveSpotlightSeasonLabel(input: {
  title: string;
  description?: string;
  synonyms?: string[];
  tvdbMatchedSeason?: boolean;
}): string | undefined {
  const season = resolveAnimeSeasonNumber(input);
  if (season === null) return undefined;

  if (input.tvdbMatchedSeason) return undefined;

  if (titleMentionsSeason(input.title, season)) return undefined;

  for (const synonym of input.synonyms ?? []) {
    if (titleMentionsSeason(synonym, season)) return undefined;
  }

  return formatSeasonLabel(season);
}

/** Багато варіантів запиту — спочатку сезонні, потім загальні. */
export function buildTvdbSearchTitles(input: {
  title: string;
  description?: string;
  synonyms?: string[];
}): string[] {
  const season = resolveAnimeSeasonNumber(input);
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(trimmed);
  };

  const base = stripSeasonFromTitle(input.title);

  if (season !== null && season >= 1 && base) {
    for (const variant of buildSeasonTitleVariants(base, season)) {
      add(variant);
    }
  }

  for (const synonym of input.synonyms ?? []) {
    add(synonym);
    if (season !== null && season >= 1) {
      const synBase = stripSeasonFromTitle(synonym);
      if (synBase && synBase !== synonym) {
        for (const variant of buildSeasonTitleVariants(synBase, season)) {
          add(variant);
        }
      }
    }
  }

  add(input.title);

  if (base && base !== input.title) {
    add(base);
  }

  return out;
}
