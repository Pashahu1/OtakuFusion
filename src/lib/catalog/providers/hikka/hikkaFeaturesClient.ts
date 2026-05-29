import { fetchHikkaFeaturesJson } from '@/lib/catalog/providers/hikka/hikkaOutboundFetch';
import type { HikkaWatchV2Response } from '@/lib/catalog/providers/hikka/hikkaTypes';

export async function fetchHikkaWatchV2(slug: string): Promise<HikkaWatchV2Response | null> {
  const s = slug.trim();
  if (!s) return null;
  return fetchHikkaFeaturesJson<HikkaWatchV2Response>(
    `/watch/v2/${encodeURIComponent(s)}`
  );
}
