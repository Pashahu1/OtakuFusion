import { resolveAnimeSeasonNumber } from './parseSeasonNumber';
import {
  buildSeasonTitleVariants,
  formatSeasonLabel,
  stripSeasonFromTitle,
  titleMentionsSeason,
} from './seasonTitleText';

/** Show "Season N" text only if TVDB did not return a season-specific match. */
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

/** Many query variants — season-specific first, then general. */
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
