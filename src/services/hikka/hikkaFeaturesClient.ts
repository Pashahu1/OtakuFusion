import type { HikkaWatchV2Response } from '@/services/hikka/hikkaTypes';

const DEFAULT_BASE = 'https://api.hikka-features.pp.ua';

function hikkaFeaturesBaseUrl(): string {
  const raw = process.env.HIKKA_FEATURES_API_BASE?.trim();
  return (raw || DEFAULT_BASE).replace(/\/+$/, '');
}

export async function fetchHikkaWatchV2(slug: string): Promise<HikkaWatchV2Response | null> {
  const s = slug.trim();
  if (!s) return null;
  const url = `${hikkaFeaturesBaseUrl()}/watch/v2/${encodeURIComponent(s)}`;
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`hikka_watch_v2_${res.status}`);
  }
  const json = (await res.json()) as HikkaWatchV2Response;
  return json && typeof json === 'object' ? json : null;
}
