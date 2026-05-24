import type { WatchStreamProvider } from '@/features/watch/lib/watch-provider';

export interface VerifiedAnicoreMapping {
  anicoreId: string;
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
  return `anicore:mapping:${localAnimeId}`;
}

export function clearVerifiedAnicoreMapping(localAnimeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getMappingCacheKey(localAnimeId, 'anicore'));
    localStorage.removeItem(`animex:mapping:${localAnimeId}`);
  } catch {

  }
}

export function clearVerifiedLibertyMapping(localAnimeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getMappingCacheKey(localAnimeId, 'aniliberty'));
  } catch {

  }
}

export function readVerifiedAnicoreMapping(
  localAnimeId: string
): VerifiedAnicoreMapping | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      localStorage.getItem(getMappingCacheKey(localAnimeId, 'anicore')) ??
      localStorage.getItem(`animex:mapping:${localAnimeId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      anicoreId?: string;
      animexId?: string;
      hasSeriesDub?: boolean;
    };
    const id =
      (typeof parsed.anicoreId === 'string' && parsed.anicoreId.trim()) ||
      (typeof parsed.animexId === 'string' && parsed.animexId.trim()) ||
      null;
    if (!id) return null;
    return {
      anicoreId: id.trim(),
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

export function writeVerifiedAnicoreMapping(
  localAnimeId: string,
  anicoreId: string,
  hasSeriesDub?: boolean
): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: { anicoreId: string; hasSeriesDub?: boolean } = {
      anicoreId: anicoreId.trim(),
    };
    if (hasSeriesDub === true) payload.hasSeriesDub = true;
    localStorage.setItem(
      getMappingCacheKey(localAnimeId, 'anicore'),
      JSON.stringify(payload)
    );
  } catch {

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

  }
}
