import type { WatchStreamProvider } from '@/lib/watch-provider';

export interface VerifiedPaheMapping {
  paheId: string;
  hasSeriesDub?: boolean;
}

export interface VerifiedLibertyMapping {
  libertyId: string;
}

export interface VerifiedHikkaMapping {
  hikkaSlug: string;
}

export function getMappingCacheKey(
  localAnimeId: string,
  provider: WatchStreamProvider
): string {
  if (provider === 'aniliberty') return `aniliberty:mapping:${localAnimeId}`;
  if (provider === 'hikka') return `hikka:mapping:${localAnimeId}`;
  return `animepahe:mapping:${localAnimeId}`;
}

export function clearVerifiedPaheMapping(localAnimeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getMappingCacheKey(localAnimeId, 'animepahe'));
  } catch {
    /* ignore */
  }
}

export function clearVerifiedLibertyMapping(localAnimeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getMappingCacheKey(localAnimeId, 'aniliberty'));
  } catch {
    /* ignore */
  }
}

export function readVerifiedPaheMapping(localAnimeId: string): VerifiedPaheMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getMappingCacheKey(localAnimeId, 'animepahe'));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { paheId?: string; hasSeriesDub?: boolean };
    if (!parsed || typeof parsed.paheId !== 'string' || !parsed.paheId.trim()) return null;
    return {
      paheId: parsed.paheId.trim(),
      hasSeriesDub: parsed.hasSeriesDub === true ? true : undefined,
    };
  } catch {
    return null;
  }
}

export function readVerifiedLibertyMapping(localAnimeId: string): VerifiedLibertyMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getMappingCacheKey(localAnimeId, 'aniliberty'));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { libertyId?: string };
    if (!parsed || typeof parsed.libertyId !== 'string' || !parsed.libertyId.trim()) return null;
    return { libertyId: parsed.libertyId.trim() };
  } catch {
    return null;
  }
}

export function writeVerifiedPaheMapping(
  localAnimeId: string,
  paheId: string,
  hasSeriesDub?: boolean
): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: { paheId: string; hasSeriesDub?: boolean } = {
      paheId: paheId.trim(),
    };
    if (hasSeriesDub === true) payload.hasSeriesDub = true;
    localStorage.setItem(getMappingCacheKey(localAnimeId, 'animepahe'), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function writeVerifiedLibertyMapping(localAnimeId: string, libertyId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      getMappingCacheKey(localAnimeId, 'aniliberty'),
      JSON.stringify({ libertyId: libertyId.trim() })
    );
  } catch {
    /* ignore */
  }
}

export function readVerifiedHikkaMapping(localAnimeId: string): VerifiedHikkaMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getMappingCacheKey(localAnimeId, 'hikka'));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { hikkaSlug?: string };
    if (!parsed || typeof parsed.hikkaSlug !== 'string' || !parsed.hikkaSlug.trim()) return null;
    return { hikkaSlug: parsed.hikkaSlug.trim() };
  } catch {
    return null;
  }
}

export function writeVerifiedHikkaMapping(localAnimeId: string, hikkaSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      getMappingCacheKey(localAnimeId, 'hikka'),
      JSON.stringify({ hikkaSlug: hikkaSlug.trim() })
    );
  } catch {
    /* ignore */
  }
}
