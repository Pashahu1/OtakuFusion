'use client';

import { useEffect } from 'react';

import { getStreamFullUrl, getStreamHeaders } from '@/features/player/ui/playerStream';
import type { StreamingData } from '@/shared/types/StreamingTypes';

function playbackUrlToOrigin(playbackUrl: string): string | null {
  try {
    const u = new URL(playbackUrl.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return null;
  }
}

interface StreamOriginPreconnectProps {
  streamUrl: string | null;
  streamInfo?: StreamingData | null;
}

/** Preconnect only to the origin Artplayer/hls.js actually hits (skip same-origin proxy). */
export function StreamOriginPreconnect({
  streamUrl,
  streamInfo,
}: StreamOriginPreconnectProps) {
  useEffect(() => {
    if (!streamUrl?.trim()) return;

    const headers = getStreamHeaders(streamInfo ?? null, streamUrl);
    const playbackUrl = getStreamFullUrl(streamUrl, headers);
    const origin = playbackUrlToOrigin(playbackUrl);
    if (!origin) return;

    if (typeof window !== 'undefined' && origin === window.location.origin) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [streamUrl, streamInfo]);

  return null;
}
