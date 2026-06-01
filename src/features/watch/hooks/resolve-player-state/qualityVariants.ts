import type { StreamingData, StreamQualityVariant } from '@/shared/types/StreamingTypes';

export function normalizeQualityVariantsFromResolve(
  raw: unknown,
): StreamingData['qualityVariants'] | undefined {
  if (!Array.isArray(raw) || raw.length < 2) return undefined;
  const out: StreamQualityVariant[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
    const r = row as Record<string, unknown>;
    const height = Number(r.height);
    const url = typeof r.url === 'string' ? r.url.trim() : '';
    const label = typeof r.label === 'string' ? r.label.trim() : '';
    const rhRaw = r.request_headers;
    let request_headers: Record<string, string> | undefined;
    if (rhRaw && typeof rhRaw === 'object' && !Array.isArray(rhRaw)) {
      const acc: Record<string, string> = {};
      for (const [k, v] of Object.entries(rhRaw)) {
        if (typeof k !== 'string' || !k.trim()) continue;
        if (typeof v !== 'string' || !v.trim()) continue;
        acc[k.trim()] = v.trim();
      }
      if (Object.keys(acc).length > 0) request_headers = acc;
    }
    if (!Number.isFinite(height) || height <= 0 || !url) continue;
    out.push({ height, label: label || `${height}p`, url, request_headers });
  }
  return out.length > 1 ? out : undefined;
}
