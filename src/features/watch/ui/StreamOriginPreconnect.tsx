'use client';

import { useEffect } from 'react';

function streamUrlToOrigin(streamUrl: string): string | null {
  try {
    const u = new URL(streamUrl.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return null;
  }
}

/**
 * Ранній DNS+TLS до хоста HLS (як preconnect на Anidap) — зменшує час до першого сегмента.
 * Працює лише для origin з `streamUrl`; не чіпає same-origin Next.
 */
export function StreamOriginPreconnect({ streamUrl }: { streamUrl: string | null }) {
  useEffect(() => {
    if (!streamUrl?.trim()) return;
    const href = streamUrlToOrigin(streamUrl);
    if (!href) return;

    const created: HTMLLinkElement[] = [];
    for (const rel of ['preconnect', 'dns-prefetch'] as const) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      created.push(link);
    }

    return () => {
      for (const link of created) {
        link.remove();
      }
    };
  }, [streamUrl]);

  return null;
}
