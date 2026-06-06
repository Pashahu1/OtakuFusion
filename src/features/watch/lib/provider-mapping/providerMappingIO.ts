import type { EpisodesTypes } from '@/shared/types/EpisodesListTypes';

import { providerMappingClientStore as clientStore } from './providerMappingClientStore';
import {
  ANIKOTO_MAPPING_KEY,
  getMappingCacheKey,
  LIBERTY_EPISODES_KEY,
  LIBERTY_EPISODES_TTL_MS,
} from './providerMappingKeys';
import type {
  CachedLibertyEpisodesPayload,
  VerifiedAnikotoMapping,
  VerifiedHikkaMapping,
  VerifiedLibertyMapping,
} from './providerMappingTypes';

export { getMappingCacheKey } from './providerMappingKeys';

export function clearVerifiedLibertyMapping(localAnimeId: string): void {
  clientStore.remove(getMappingCacheKey(localAnimeId, 'aniliberty'));
  clearLibertyEpisodesCache(localAnimeId);
}

export function readVerifiedLibertyMapping(localAnimeId: string): VerifiedLibertyMapping | null {
  const raw = clientStore.get(getMappingCacheKey(localAnimeId, 'aniliberty'));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { libertyId?: string };
    if (!parsed || typeof parsed.libertyId !== 'string' || !parsed.libertyId.trim()) return null;
    return { libertyId: parsed.libertyId.trim() };
  } catch {
    return null;
  }
}

export function writeVerifiedLibertyMapping(localAnimeId: string, libertyId: string): void {
  clientStore.set(
    getMappingCacheKey(localAnimeId, 'aniliberty'),
    JSON.stringify({ libertyId: libertyId.trim() }),
  );
}

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

export function readLibertyEpisodesCache(
  localAnimeId: string,
  libertyId: string,
): { episodes: EpisodesTypes[]; totalEpisodes: number } | null {
  const expectedId = libertyId.trim();
  if (!expectedId) return null;
  const raw = clientStore.get(LIBERTY_EPISODES_KEY(localAnimeId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedLibertyEpisodesPayload;
    if (parsed.libertyId?.trim() !== expectedId) return null;
    if (!Array.isArray(parsed.episodes) || !parsed.episodes.length) return null;
    if (Date.now() - (parsed.savedAt ?? 0) > LIBERTY_EPISODES_TTL_MS) return null;
    const total =
      typeof parsed.totalEpisodes === 'number' && parsed.totalEpisodes > 0
        ? parsed.totalEpisodes
        : parsed.episodes.length;
    return { episodes: parsed.episodes, totalEpisodes: total };
  } catch {
    return null;
  }
}

export function writeLibertyEpisodesCache(
  localAnimeId: string,
  libertyId: string,
  episodes: EpisodesTypes[],
  totalEpisodes: number,
): void {
  const id = libertyId.trim();
  if (!id || !episodes.length) return;
  const payload: CachedLibertyEpisodesPayload = {
    libertyId: id,
    episodes,
    totalEpisodes: totalEpisodes > 0 ? totalEpisodes : episodes.length,
    savedAt: Date.now(),
  };
  clientStore.set(LIBERTY_EPISODES_KEY(localAnimeId), JSON.stringify(payload));
}

export function clearLibertyEpisodesCache(localAnimeId: string): void {
  clientStore.remove(LIBERTY_EPISODES_KEY(localAnimeId));
}
