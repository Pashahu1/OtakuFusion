import { unstable_cache } from 'next/cache';

import { buildCatalogSearchTermsFromFields } from '@/lib/catalog/catalog-hints';
import {
  anikotoHitHasEnglish,
  anikotoHitHasJapanese,
  pickAnikotoSearchHit,
} from '@/lib/catalog/providers/anikoto/scoreAnikotoSearchHit';
import type { AnikotoMatchHints } from '@/lib/catalog/providers/anikoto/anikotoTypes';

import { anikotoDubPlaylistIsDistinct } from '@/lib/catalog/providers/anikoto/mapAnikotoStream';

import { fetchAnikotoStream, searchAnikoto } from './client';
import { ANIKOTO_STREAM_SERVERS } from './config';

export interface AnikotoMatchQuery extends AnikotoMatchHints {
  title: string;
  romaji_title?: string;
  japanese_title?: string;
  synonyms?: string;
}

export interface AnikotoMatchResult {
  id: string;
  title: string;
  hasJapanese: boolean;
  hasEnglish: boolean;
}

function matchCacheKey(input: AnikotoMatchQuery): string {
  return [
    input.title.trim().toLowerCase(),
    input.romaji_title?.trim().toLowerCase() ?? '',
    input.japanese_title?.trim().toLowerCase() ?? '',
    input.synonyms?.trim().toLowerCase() ?? '',
    String(input.episodeCount ?? ''),
    input.format?.trim().toLowerCase() ?? '',
  ].join('|');
}

async function englishAudioIsDistinct(id: string): Promise<boolean> {
  const server = ANIKOTO_STREAM_SERVERS[0];
  if (!server) return false;
  const [sub, dub] = await Promise.all([
    fetchAnikotoStream({ id, episode: 1, server, type: 'sub' }),
    fetchAnikotoStream({ id, episode: 1, server, type: 'dub' }),
  ]);
  return anikotoDubPlaylistIsDistinct(sub?.url ?? null, dub?.url ?? null);
}

async function toMatchResult(hit: {
  id: string;
  title: string;
  sub?: string | number | null;
  dub?: string | number | null;
}): Promise<AnikotoMatchResult> {
  const hasJapanese = anikotoHitHasJapanese(hit);
  let hasEnglish = anikotoHitHasEnglish(hit);
  if (hasEnglish) {
    try {
      hasEnglish = await englishAudioIsDistinct(hit.id);
    } catch {
      hasEnglish = anikotoHitHasEnglish(hit);
    }
  }
  return {
    id: hit.id,
    title: hit.title,
    hasJapanese,
    hasEnglish,
  };
}

async function matchAnikotoCatalog(input: AnikotoMatchQuery): Promise<AnikotoMatchResult | null> {
  const terms = buildCatalogSearchTermsFromFields({
    title: input.title,
    romaji_title: input.romaji_title,
    japanese_title: input.japanese_title,
    synonyms: input.synonyms,
  });
  if (!terms.length) return null;

  const hints: AnikotoMatchHints = {
    episodeCount: input.episodeCount,
    format: input.format,
  };
  const seen = new Set<string>();
  const hits = [];
  for (const term of terms.slice(0, 4)) {
    const key = term.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const batch = await searchAnikoto(term);
    hits.push(...batch);
    const early = pickAnikotoSearchHit(hits, terms, hints);
    if (early && (anikotoHitHasJapanese(early) || anikotoHitHasEnglish(early))) {
      return toMatchResult(early);
    }
  }

  const picked = pickAnikotoSearchHit(hits, terms, hints);
  if (!picked) return null;
  return toMatchResult(picked);
}

export async function matchAnikotoCatalogCached(
  input: AnikotoMatchQuery,
): Promise<AnikotoMatchResult | null> {
  const key = matchCacheKey(input);
  const cached = unstable_cache(async () => matchAnikotoCatalog(input), ['anikoto-match-v2', key], {
    revalidate: 600,
  });
  return cached();
}
