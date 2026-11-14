import { formatsAreCompatible } from '@/lib/catalog/providers/hikka/hikkaCatalogIdentity';

import type { AnikotoMatchHints, AnikotoSearchHit } from './anikotoTypes';

export const ANIKOTO_MATCH_MIN_SCORE = 75;

const COUR_WORD = /\b(?:season|stage|cour|part)\b/;

export function normalizeAnikotoTitle(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFKC')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function anikotoAudioCount(value: string | number | null | undefined): number {
  if (value == null || value === '') return 0;
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.floor(count);
}

export function anikotoHitHasJapanese(hit: AnikotoSearchHit): boolean {
  return anikotoAudioCount(hit.sub) > 0;
}

export function anikotoHitHasEnglish(hit: AnikotoSearchHit): boolean {
  return anikotoAudioCount(hit.dub) > 0;
}

export function courNumbers(title: string): number[] {
  const normalized = normalizeAnikotoTitle(title);
  if (!COUR_WORD.test(normalized)) return [];
  const found = new Set<number>();
  for (const match of normalized.matchAll(/\b(?:season|part|stage|cour)\s+(\d+)\b/g)) {
    const value = Number(match[1]);
    if (value > 0) found.add(Math.floor(value));
  }
  for (const match of normalized.matchAll(/\b(\d+)(?:st|nd|rd|th)\b/g)) {
    const value = Number(match[1]);
    if (value > 0) found.add(Math.floor(value));
  }
  return [...found];
}

function coursConflict(hitTitle: string, query: string): boolean {
  const hitCours = courNumbers(hitTitle);
  const queryCours = courNumbers(query);
  if (queryCours.length && !queryCours.some((cour) => hitCours.includes(cour))) return true;
  return !queryCours.length && hitCours.some((cour) => cour > 1);
}

function tokenOverlap(left: string, right: string): number {
  const leftTokens = left.split(' ').filter((token) => token.length > 1);
  const rightTokens = right.split(' ').filter((token) => token.length > 1);
  if (!leftTokens.length || !rightTokens.length) return 0;
  const rightSet = new Set(rightTokens);
  let shared = 0;
  for (const token of leftTokens) {
    if (rightSet.has(token)) shared += 1;
  }
  return shared / Math.max(leftTokens.length, rightTokens.length);
}

function titleScore(hitTitle: string, query: string): number {
  if (!query) return 0;
  if (hitTitle === query) return 120;
  if (
    !coursConflict(hitTitle, query) &&
    (hitTitle.startsWith(`${query} `) || query.startsWith(`${hitTitle} `))
  ) {
    return 92;
  }
  return Math.round(tokenOverlap(hitTitle, query) * 80);
}

function episodeCountAdjustment(
  expected: number | null | undefined,
  hit: AnikotoSearchHit,
): number {
  if (expected == null || expected <= 0) return 0;
  const actual = anikotoAudioCount(hit.episodes) || anikotoAudioCount(hit.sub);
  if (actual <= 0) return 0;
  const delta = Math.abs(actual - expected);
  if (delta <= 2) return 12;
  if (delta / Math.max(expected, actual) <= 0.25) return 4;
  return -30;
}

function seasonAdjustment(hitTitle: string, queries: string[]): number {
  const hitCours = courNumbers(hitTitle);
  const queryCours = queries.flatMap((query) => courNumbers(query));
  if (!hitCours.length && !queryCours.length) return 0;
  if (queryCours.length && hitCours.some((cour) => queryCours.includes(cour))) return 8;
  if (queryCours.length) return -80;
  return hitCours.some((cour) => cour > 1) ? -70 : 0;
}

export function scoreAnikotoSearchHit(
  hit: AnikotoSearchHit,
  terms: string[],
  hints: AnikotoMatchHints = {},
): number {
  const hitTitle = normalizeAnikotoTitle(hit.title);
  if (!hitTitle || !hit.id.trim()) return 0;

  const queries = terms
    .map((term) => normalizeAnikotoTitle(term))
    .filter((term) => term.length >= 2);

  let best = 0;
  for (const query of queries) {
    best = Math.max(best, titleScore(hitTitle, query));
  }
  if (best <= 0) return 0;

  best += seasonAdjustment(hit.title, queries);
  best += episodeCountAdjustment(hints.episodeCount, hit);
  if (
    hints.format &&
    hit.type &&
    !formatsAreCompatible(hints.format, hit.type)
  ) {
    best -= 40;
  }
  return best;
}

export function pickAnikotoSearchHit(
  hits: AnikotoSearchHit[],
  terms: string[],
  hints: AnikotoMatchHints = {},
): AnikotoSearchHit | null {
  let best: { hit: AnikotoSearchHit; score: number } | null = null;
  for (const hit of hits) {
    const score = scoreAnikotoSearchHit(hit, terms, hints);
    if (!best || score > best.score) best = { hit, score };
  }
  if (!best || best.score < ANIKOTO_MATCH_MIN_SCORE) return null;
  return best.hit;
}
