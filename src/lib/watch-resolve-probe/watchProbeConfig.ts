import type { WatchProbeConfig, WatchProbeRequestLang } from './watchProbeTypes';

function clampMs(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(45_000, Math.max(1200, Math.floor(value)));
}

export function readWatchProbeConfig(requestedLang: WatchProbeRequestLang): WatchProbeConfig {
  const masterRaw = Number(process.env.WATCH_PROBE_MASTER_MS);
  const variantRaw = Number(process.env.WATCH_PROBE_VARIANT_MS);
  const envRaw = process.env.WATCH_PROBE_SKIP_VARIANT?.trim().toLowerCase();

  let skipVariant: boolean;
  if (envRaw === '1' || envRaw === 'true') {
    skipVariant = true;
  } else if (envRaw === '0' || envRaw === 'false') {
    skipVariant = false;
  } else {
    skipVariant = requestedLang === 'dub';
  }

  return {
    masterMs: clampMs(masterRaw, 3200),
    variantMs: clampMs(variantRaw, 2400),
    skipVariant,
  };
}
