import { providerMappingClientStore as clientStore } from './providerMappingClientStore';
import {
  ANIKOTO_MAPPING_KEY,
  getMappingCacheKey,
} from './providerMappingKeys';
import type {
  VerifiedAnikotoMapping,
  VerifiedHikkaMapping,
} from './providerMappingTypes';

export { getMappingCacheKey } from './providerMappingKeys';

export function readVerifiedHikkaMapping(localAnimeId: string): VerifiedHikkaMapping | null {
  const raw = clientStore.get(getMappingCacheKey(localAnimeId, 'hikka'));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { hikkaSlug?: string };
    if (!parsed || typeof parsed.hikkaSlug !== 'string' || !parsed.hikkaSlug.trim()) return null;
    return { hikkaSlug: parsed.hikkaSlug.trim() };
  } catch {
    return null;
  }
}

export function writeVerifiedHikkaMapping(localAnimeId: string, hikkaSlug: string): void {
  clientStore.set(
    getMappingCacheKey(localAnimeId, 'hikka'),
    JSON.stringify({ hikkaSlug: hikkaSlug.trim() }),
  );
}

export function clearVerifiedAnikotoMapping(localAnimeId: string): void {
  clientStore.remove(ANIKOTO_MAPPING_KEY(localAnimeId));
}

export function readVerifiedAnikotoMapping(localAnimeId: string): VerifiedAnikotoMapping | null {
  const raw = clientStore.get(ANIKOTO_MAPPING_KEY(localAnimeId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { anikotoSlug?: string };
    if (!parsed || typeof parsed.anikotoSlug !== 'string' || !parsed.anikotoSlug.trim()) {
      return null;
    }
    return { anikotoSlug: parsed.anikotoSlug.trim() };
  } catch {
    return null;
  }
}

export function writeVerifiedAnikotoMapping(localAnimeId: string, anikotoSlug: string): void {
  clientStore.set(
    ANIKOTO_MAPPING_KEY(localAnimeId),
    JSON.stringify({ anikotoSlug: anikotoSlug.trim() }),
  );
}
