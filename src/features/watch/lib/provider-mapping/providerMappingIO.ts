import { providerMappingClientStore as clientStore } from './providerMappingClientStore';
import { getMappingCacheKey } from './providerMappingKeys';
import type { VerifiedHikkaMapping } from './providerMappingTypes';

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
