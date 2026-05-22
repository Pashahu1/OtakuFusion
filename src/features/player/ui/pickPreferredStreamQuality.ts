import type { StreamQualityVariant } from '@/shared/types/StreamingTypes';

export const DEFAULT_PLAYBACK_QUALITY_HEIGHT = 720;

export function pickPreferredQualityVariant(
  variants: StreamQualityVariant[] | undefined,
  fallbackUrl: string
): { url: string; request_headers?: Record<string, string> } {
  const raw = fallbackUrl.trim();
  if (!variants?.length) {
    return { url: raw };
  }

  const exact720 = variants.find((v) => v.height === DEFAULT_PLAYBACK_QUALITY_HEIGHT);
  if (exact720?.url?.trim()) {
    return {
      url: exact720.url.trim(),
      request_headers: exact720.request_headers,
    };
  }

  const atOrBelow720 = [...variants]
    .filter((v) => v.height > 0 && v.height <= DEFAULT_PLAYBACK_QUALITY_HEIGHT)
    .sort((a, b) => b.height - a.height);
  if (atOrBelow720[0]?.url?.trim()) {
    return {
      url: atOrBelow720[0].url.trim(),
      request_headers: atOrBelow720[0].request_headers,
    };
  }

  const sorted = [...variants].sort((a, b) => b.height - a.height);
  const best = sorted[0];
  if (best?.url?.trim()) {
    return { url: best.url.trim(), request_headers: best.request_headers };
  }

  return { url: raw };
}
