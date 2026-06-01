import type { StreamQualityVariant } from '@/shared/types/StreamingTypes';

export const DEFAULT_PLAYBACK_QUALITY_HEIGHT = 1080;

export interface QualityVariantPick {
  url: string;
  request_headers?: Record<string, string>;
  height: number;
}

function variantHeight(v: StreamQualityVariant): number {
  return Number(v.height ?? 0);
}

function sortedByHeightDesc(variants: StreamQualityVariant[]): StreamQualityVariant[] {
  return [...variants]
    .filter((v) => v.url?.trim() && variantHeight(v) > 0)
    .sort((a, b) => variantHeight(b) - variantHeight(a));
}

function toVariantResult(v: StreamQualityVariant): QualityVariantPick {
  return {
    url: v.url.trim(),
    request_headers: v.request_headers,
    height: variantHeight(v),
  };
}

/** Prefer 1080p, then highest below 1080, else lowest above. */
export function pickPreferredQualityVariant(
  variants: StreamQualityVariant[] | undefined,
  fallbackUrl: string,
): QualityVariantPick {
  const raw = fallbackUrl.trim();
  if (!variants?.length) return { url: raw, height: 0 };

  const ranked = sortedByHeightDesc(variants);
  if (!ranked.length) return { url: raw, height: 0 };

  const exact1080 = ranked.find((v) => variantHeight(v) === DEFAULT_PLAYBACK_QUALITY_HEIGHT);
  if (exact1080) return toVariantResult(exact1080);

  const atOrBelow1080 = ranked.filter((v) => variantHeight(v) <= DEFAULT_PLAYBACK_QUALITY_HEIGHT);
  if (atOrBelow1080[0]) return toVariantResult(atOrBelow1080[0]);

  return toVariantResult(ranked[ranked.length - 1]);
}
